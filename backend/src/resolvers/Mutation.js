const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");
const { hasPermission } = require("../utils");
const stripe = require('../stripe');

const mutations = {
  //TODO: check if they are logged in
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error(`You must be logged in to do that`);
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            connect: {
              id: ctx.request.userId,
            },
          },
          ...args,
        },
      },
      info
    );

    return item;
  },
  updateItem(parent, args, ctx, info) {
    //first take a copy of the new data
    const updates = { ...args };
    //remove the ID from the updates, bec. we dont want to update the id
    delete updates.id;
    //return the udpdate method
    //since we are returning this promise base function, it will wait for the update to pass
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info //that tells the resolver what to return (it reutrns an item as we wrote in our schema)
    ); //info will contain the query that we sent from the client side to return that item.
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{ id title user { id }}`);
    // 2. Check if they own that item, or have the permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    );

    if (!ownsItem && !hasPermissions) {
      throw new Error("You don't have permission to do that!");
    }

    // 3. Delete it!
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    //lowercase their email
    args.email = args.email.toLowerCase();
    //hash password
    const password = await bcrypt.hash(args.password, 10);
    //create the user in the db
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] },
        },
      },
      info
    );
    //create the jwt token for the new user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    //we set the jwt as a cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    //1. check if there is a user with that email
    //2. check if their password is correct
    //3. generate the JWT Token
    //4. set the cookie with the Token
    //5. return the user

    //1
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No Such user is found for email ${email}`);
    }
    //2
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid Password");
    }
    //3
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //4
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    //5
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Goodbye" };
  },
  async requestReset(parent, args, ctx, info) {
    //1. check if this is a real user
    //2. set a reset token and expiry on that user
    //3. email item that reset token

    //1
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No Such user is found for email ${args.email}`);
    }

    //2.
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString("hex");

    const resetTokenExpiry = Date.now() + 3600000; //1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });


    //3.
    const mailRes = await transport.sendMail({
      from: "mo@mo.example.com",
      to: user.email,
      subject: "Your Password Reset Token",
      html: makeANiceEmail(`Your Password Reset Token is here!
     \n\n
     <a href="${
       process.env.FRONTEND_URL
     }/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
    });
    //4. return
    return { message: "Thanks!" };
  },
  async resetPassword(parent, args, ctx, info) {
    //1. check if the passwords match
    //2. check if its a legit reset token
    //3. check if its expired
    //4. hash new passwrod
    //5. save the new password to the user and remove the old resetToken fields
    //6. generate jwt
    //7. set the jwt cookie
    //8. return the new user

    //1
    const valid = await bcrypt.compare(args.password, args.confirmPassword);
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords do not match");
    }
    // //2
    // const user = ctx.db.query.user({where: {resetToken: args.resetToken}});
    // if(!user){
    //   throw new Error(`No Such user is found`);
    // }
    // //3
    // if(user.resetTokenExpiry < Date.now()){
    //   throw new Error(`Token Expired!`);
    // }
    //2,3 this means get only the first occurrence
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) {
      throw new Error(`the token is either invalid or undefined`);
    }
    //4
    const password = await bcrypt.hash(args.password, 10);
    //5
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    //6
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    //7
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    //8
    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    //1. check if they are logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in");
    }
    //2. query the current user
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        },
      },
      info
    );
    //3. check if they have permissions to do this
    hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);
    //4. update the permission
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        where: {
          id: args.userId,
        },
      },
      info
    );
  },
  async addToCart(parent, args,ctx,info){
    //1. make sure they are signed in
    const {userId} = await ctx.request;
    if(!userId){
      throw new Error('You must be Signed In to do that');
    }
    //2. Query the user's current cart...these two brackets mean get only the first value
    //we will never have more that one value returned from this query because 
    //it will never happen that there is a user with the same item twice
    const [existingCartItem] = await ctx.db.query.cartItems({
      where:{
        user:{id:userId},
        item:{id:args.id}
      }
    });
    //3. check if that item is already in their cart and increment by 1 if it is
  if(existingCartItem){
    return await ctx.db.mutation.updateCartItem({
      where: {id: existingCartItem.id},
      data:{quantity: existingCartItem.quantity + 1}
    },info);
  }
    //4. if it is not, create a fresh cartItem for that user
  return await ctx.db.mutation.createCartItem({
    data:{
      user:{
        connect: {id: userId  }//connect is to make a relashionship between two models
      },
      item:{
        connect: {id: args.id}
      }
    }
  }, info);
  },
  async removeFromCart(parent, args,ctx,info) {
    //1. Find the cart Item
    const cartItem = await ctx.db.query.cartItem({where:{
      id: args.id
    }},'{id, user { id }}');
    //2 make sure we found an item
    if(!cartItem) throw new Error('No Cart Item Found!');

    //3. make sure they own that cart item
    const ownsCartItem = cartItem.user.id === ctx.request.userId;
    if(!ownsCartItem){
      throw new Error('Cheaaaating ??!!');
    }
    //4. delete that cartitem
    return  ctx.db.mutation.deleteCartItem({where: {
      id: cartItem.id
    }}, info);
  },
  async createOrder(parent, args, ctx, info) {
    //1. query the current user and make sure they are signed in
    const {userId} = ctx.request;
    if(!userId)
      throw new Error('You must be signed in to complete this order');
    const user = await ctx.db.query.user({where: {id: userId}},
      `
      {id
      name
      email
      cart {
        id
        quantity
        item {title price id description image largeImage}
      }}`
      ) 
    //2. recalculate the total price (bec someone might chang the price on frontend, u dont want the user to tell u how much to charge)
    const amount = user.cart.reduce((tally,cartItem) => tally+cartItem.item.price * cartItem.quantity,0);
    //3. create the stripe charge
      const charge = await stripe.charges.create({
        amount,
        currency: 'USD',
        source: args.token,
      })
    //4. convert the cartItems to OrderItems
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: {connect:{id: userId}},
      };
      delete orderItem.id;//because this is the id of the cartItem.item but we need a new one.
      return orderItem;
    });
    //5. create the order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: {create: orderItems},//prismaaa creates new orderItems for us andd add them to this field
        user: {connect: {id: userId}},
      },
    }, info);

    //6. clean-up - clear the users cart, delete 
    const cartItemsIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemsIds
      }
    }, info);

    //7. return the order to the client
    return order;
  }
  // createDog(parent, args, ctx, info){
  //     global.dogs = global.dogs || [];
  //     const newDog = {name: args.name};
  //     global.dogs.push(newDog);
  //     return newDog;
  // }
};

module.exports = mutations;
