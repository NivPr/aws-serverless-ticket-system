const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const ddbClient = new DynamoDBClient({ region: "eu-west-1" });


async function createUserRecordInDynamoDB(userId, email) {
  const command = new PutItemCommand({
    TableName: "ticketAppUsers",
    Item: {
      userId: { S: userId },
      email: { S: email },
      createdAt: { S: new Date().toISOString() }
    }
  });

  try {
    await ddbClient.send(command);
    console.log("User added successfully");
  } catch (err) {
    console.error("DynamoDB error:", err);
  }
}

module.exports = { createUserRecordInDynamoDB };