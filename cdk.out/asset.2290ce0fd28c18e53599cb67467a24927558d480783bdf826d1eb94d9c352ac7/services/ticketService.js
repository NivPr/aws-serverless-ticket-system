const {
    PutItemCommand,
    GetItemCommand,
    DeleteItemCommand,
    ScanCommand
  } = require('@aws-sdk/client-dynamodb');
  const { v4: uuidv4 } = require('uuid');
  const client = require('../utils/dynamoClient');
  
  async function createTicket({ userId, status, price, title, description }) {
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
  
  module.exports = { createTicket, searchTicketsByTitle, deleteTicket };
  