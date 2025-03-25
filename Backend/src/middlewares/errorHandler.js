// Your API throws an error → throw new ApiError(409, "User already exists").

// The asyncHandler catches it and passes it to next(err).

// errorHandler checks if it's an ApiError and sends a JSON response.

// Your frontend gets the correct error message in JSON instead of an ugly HTML page.

import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    // console.error("Error Middleware:", err); // Logs full error details

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};
export { errorHandler };
