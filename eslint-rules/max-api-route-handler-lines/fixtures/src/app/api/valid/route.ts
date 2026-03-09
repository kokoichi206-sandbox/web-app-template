/**
 * Valid API route handler - under 80 lines
 * This file should NOT trigger the max-api-route-handler-lines rule
 */

import { NextResponse } from "next/server";

import { logger } from "@/shared/logger";

/**
 * Simple API route handler that delegates to server logic
 */
export const GET = async () => {
  try {
    logger.info("Processing GET request");

    // Delegate to server-side logic
    const result = { message: "Success" };

    return NextResponse.json(result);
  } catch (error) {
    logger.error({ err: error }, "Failed to process request");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

export const POST = async () => {
  try {
    logger.info("Processing POST request");

    // Delegate to server-side logic
    const result = { message: "Created" };

    return NextResponse.json(result);
  } catch (error) {
    logger.error({ err: error }, "Failed to process request");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
