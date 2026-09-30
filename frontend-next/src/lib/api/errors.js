import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function withErrorHandling(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

function toErrorResponse(err) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (
    err.name === "MongooseServerSelectionError" ||
    err.name === "MongoNetworkError" ||
    /querySrv|ENOTFOUND|ECONNREFUSED|server selection|failed to connect/i.test(message)
  ) {
    statusCode = 503;
    message = "Database is unavailable. Check DB_URL / Atlas cluster status / IP allow-list.";
  }
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found with this id. Invalid ${err.path}`;
  }
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate key ${Object.keys(err.keyValue)} entered`;
  }
  if (err.name === "JsonWebTokenError") {
    statusCode = 400;
    message = "Your session is invalid, please try again later";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 400;
    message = "Your session is expired, please try again later";
  }
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  return NextResponse.json({ success: false, message }, { status: statusCode });
}
