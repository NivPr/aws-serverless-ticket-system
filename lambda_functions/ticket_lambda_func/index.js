const { createTicket, searchTicketsByTitle, deleteTicket, updateTicket } = require('./services/ticketService');
// github connection works!!!!!!
exports.handler = async (event) => {
  console.log("Incoming Event:", JSON.stringify(event, null, 2));

  try {
    const method = event.httpMethod;
    const path = event.path;
    const claims = event.requestContext?.authorizer?.claims;

    console.log("Claims:", claims);

    if (!claims) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized: No claims found" })
      };
    }

    const userId = claims?.sub;
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized: No userId found" })
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { status, price, title, description, ticketId } = body;

    // POST /tickets/addTicket
    if (method === "POST" && path.endsWith("/tickets/addTicket")) {
      console.log("Adding ticket for user:", userId);
      const result = await createTicket({ userId, status, price, title, description });
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Ticket added!", data: result })
      };
    }

    if (method === "PUT" && path.endsWith("/tickets/editTicket")) {
      if (!ticketId) 
        return { statusCode: 400, body: JSON.stringify({ message: "Missing ticketId" }) };
      
      const updatedFields = { title, description, price, status };
      Object.keys(updatedFields).forEach(key => updatedFields[key] === undefined && delete updatedFields[key]);
      
      return await updateTicket(ticketId, userId, updatedFields);
    }

    // GET /tickets/searchByTitle?keyword=...
    if (method === "GET" && path.endsWith("/tickets/searchByTitle")) {
      const keyword = event.queryStringParameters?.keyword;
      if (!keyword) return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing keyword" })
      };

      const items = await searchTicketsByTitle(keyword);
      const tickets = items.map(item => ({
        Id: item.Id.S,
        userId: item.userId.S,
        createdAt: item.createdAt.S,
        status: item.status.S,
        price: Number(item.price.N),
        title: item.title.S,
        description: item.description.S,
      }));

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Search results", tickets })
      };
    }

    // DELETE /tickets/delete
    if (method === "DELETE" && path.endsWith("/tickets/delete")) {
      if (!ticketId) return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing ticketId" })
      };
      return await deleteTicket(ticketId, userId);
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Route not found" })
    };

  } catch (err) {
    console.error("Handler Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error: err.message })
    };
  }
};
