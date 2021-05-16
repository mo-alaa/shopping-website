const { forwardTo } = require("prisma-binding");
const {hasPermission} = require("../utils");

const Query = {
  // async items(parent, args, ctx, info) {
  //     const items = await ctx.db.query.items();
  //     return items;
  // },
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    //check if there is a current user id
    // console.log({ctx});
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      }, info);
  },
  async users(parent,args,ctx,info){
    //1. check if user is signed in
    if(!ctx.request.userId){
      throw new Error('You must be logged in');
    }
    //2. check if user has permission to do that
    hasPermission(ctx.request.user, ['ADMIN','PERMISSIONUPDATE']);
    //3. return all users
    return await ctx.db.query.users({},info);
    //info contains the gql query that contains 
    //the fields we are requesting from the frontend

  },
  async order(parent,args,ctx, info) {
    //1. make sure theu are logged in
    if(!ctx.request.userId){
      throw new Error('You are mot logged in');
    }
    //2. Query the current order
    const order = await ctx.db.query.order(
      {where: {id: args.id}},
      info
    );
    //3. check if they have the permission to see this order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');
    if(!ownsOrder || !hasPermission) {
      throw new Error('You cant see this budd');
    }
    //4. Return the order
    return order;
  }, 
  async orders(parent, args,ctx,info) {
    //1. make sure they are logged in
    if(!ctx.request.userId){
      throw new Error('You are mot logged in');
    }
    //2. check if they have permission
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');
    if(!hasPermissionToSeeOrder) {
      throw new Error('You cant see this budd');
    }
    //3. get all users order
    const orders = await ctx.db.query.orders(
      {where: {user:{id: ctx.request.userId}}}, 
      info
    );
    //4. return orders
    return orders;
  }
  // dogs(parent, args, ctx, info) {
  //     global.dogs = global.dogs || [];
  //     return global.dogs;
  // },
};

module.exports = Query;
