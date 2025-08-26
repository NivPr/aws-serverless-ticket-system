const {
    PutItemCommand,
    UpdateItemCommand,
    GetItemCommand,
    DeleteItemCommand,
    ScanCommand
  } = require('@aws-sdk/client-dynamodb');
  const { v4: uuidv4 } = require('uuid');
 const ddbClient = new DynamoDBClient({ region: "eu-west-1" });  ;


  async function createTicket({ userId, status, price, title, description }) {

    if (!userId || !status || price == null || !title) {
      throw new Error("Missing required fields");
    }
    // if (typeof price !== "number" || price < 0) {
    //   throw new Error("Invalid price");
    // }
    const ticketId = uuidv4();
    const createdAt = new Date().toISOString();
  
    const params = {
      TableName: "Tickets",
      Item: {
        Id: { S: ticketId },
        userId: { S: userId },
        createdAt: { S: createdAt },
        status: { S: status },
        price: { N: price.toString() },
        title: { S: title },
        description: { S: description },
      },
    };
  
    await client.send(new PutItemCommand(params));
    
  }
  
  async function searchTicketsByTitle(keyword) {
    const params = {
      TableName: "Tickets",
      FilterExpression: "contains(#title, :keyword)",
      ExpressionAttributeNames: { "#title": "title" },
      ExpressionAttributeValues: { ":keyword": { S: keyword } }
    };
  
    const result = await client.send(new ScanCommand(params));
    return result.Items || [];
  }
  
  async function deleteTicket(ticketId, userId) {
    const getParams = {
      TableName: "Tickets",
      Key: { Id: { S: ticketId } },
    };
  
    const ticket = (await client.send(new GetItemCommand(getParams))).Item;
    if (!ticket) return { statusCode: 404, body: JSON.stringify({ message: "Ticket not found" }) };
    if (ticket.userId.S !== userId) return { statusCode: 403, body: JSON.stringify({ message: "Forbidden" }) };
  
    const delParams = { TableName: "Tickets", Key: { Id: { S: ticketId } } };
    await client.send(new DeleteItemCommand(delParams));
    return { statusCode: 200, body: JSON.stringify({ message: "Ticket deleted successfully" }) };
  }

 
  async function updateTicket(ticketId, userId, fields) {
    // Step 1: Fetch the ticket by ticketId
    const getParams = {
      TableName: 'Tickets',
      Key: {
        Id: { S: ticketId }
      }
    };
  
    const ticket = (await client.send(new GetItemCommand(getParams))).Item;
  
    // Step 2: Check if the ticket exists
    if (!ticket) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Ticket not found' })
      };
    }
  
    // Step 3: Check if the user is the owner of the ticket
    if (ticket.userId.S !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'You are not allowed to update this ticket' })
      };
    }
  
    // Step 4: Build the update expression
    const keys = Object.keys(fields);
    const exprNames = Object.fromEntries(keys.map(k => [`#${k}`, k]));
    const exprValues = Object.fromEntries(
      keys.map(k => [`:${k}`, { S: fields[k] }]) // You can adjust this for numeric fields if needed
    );
    const updateExpr = 'SET ' + keys.map(k => `#${k} = :${k}`).join(', ');
  
    const params = {
      TableName: 'Tickets',
      Key: {
        Id: { S: ticketId }
      },
      UpdateExpression: updateExpr,
      ExpressionAttributeNames: exprNames,
      ExpressionAttributeValues: exprValues,
      ReturnValues: 'ALL_NEW'
    };
  
    // Step 5: Execute the update
    const result = await client.send(new UpdateItemCommand(params));
  
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
    };
  }
  
  module.exports = { createTicket, searchTicketsByTitle, deleteTicket,updateTicket };
  