package com.burakcanaksoy.realestate.exception;

public class InvalidComparisonException extends RuntimeException {

    public InvalidComparisonException(String message) {
        super(message);
    }

    public InvalidComparisonException(String message, Throwable cause) {
        super(message, cause);
    }
}
