package com.burakcanaksoy.realestate.exception;

import com.burakcanaksoy.realestate.response.ValidationErrorResponse;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationException(
            MethodArgumentNotValidException exception) {
        Map<String, String> errors = new HashMap<>();

        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ValidationErrorResponse response = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                errors,
                LocalDateTime.now());
        return ResponseEntity.badRequest().body(response);
    }

    // ENUM-VALIDATION
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ValidationErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {

        String message = "Invalid input";
        Map<String, String> errors = new HashMap<>();

        Throwable cause = ex.getCause();

        if (cause instanceof InvalidFormatException) {
            InvalidFormatException ifx = (InvalidFormatException) cause;

            if (ifx.getTargetType() != null && ifx.getTargetType().isEnum()) {
                String fieldName = ifx.getPath().get(0).getFieldName();
                Object invalidValue = ifx.getValue();

                String errorMessage = String.format(
                        "Invalid value '%s' for field '%s'. Accepted values: %s",
                        invalidValue,
                        fieldName,
                        Arrays.toString(ifx.getTargetType().getEnumConstants()));

                errors.put(fieldName, errorMessage);
                message = "Validation failed";
            }
        } else if (cause instanceof com.fasterxml.jackson.databind.exc.MismatchedInputException) {
            com.fasterxml.jackson.databind.exc.MismatchedInputException mix = (com.fasterxml.jackson.databind.exc.MismatchedInputException) cause;

            if (mix.getTargetType() != null && mix.getTargetType().isEnum()) {
                String fieldName = mix.getPath().get(0).getFieldName();

                String errorMessage = String.format(
                        "Field '%s' cannot be empty. Accepted values: %s",
                        fieldName,
                        Arrays.toString(mix.getTargetType().getEnumConstants()));

                errors.put(fieldName, errorMessage);
                message = "Validation failed";
            }
        } else {
            String errorMsg = ex.getMostSpecificCause().getMessage();

            if (errorMsg.contains("reference chain:") && errorMsg.contains("[\"")) {
                int start = errorMsg.lastIndexOf("[\"") + 2;
                int end = errorMsg.lastIndexOf("\"]");
                if (start > 1 && end > start) {
                    String fieldName = errorMsg.substring(start, end);
                    errors.put(fieldName, "Invalid value or format");
                    message = "Validation failed";
                }
            }
        }

        ValidationErrorResponse errorResponse = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                message,
                errors.isEmpty() ? null : errors,
                LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ValidationErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        });

        ValidationErrorResponse errorResponse = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Constraint violation",
                errors,
                LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ValidationErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {

        ValidationErrorResponse errorResponse = new ValidationErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage() != null ? ex.getMessage() : "Entity not found",
                null,
                LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ValidationErrorResponse> handleAccessDenied(AccessDeniedException ex) {

        ValidationErrorResponse errorResponse = new ValidationErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                ex.getMessage() != null ? ex.getMessage() : "Access denied",
                null,
                LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(InvalidComparisonException.class)
    public ResponseEntity<ValidationErrorResponse> handleInvalidComparison(InvalidComparisonException ex) {

        ValidationErrorResponse errorResponse = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage() != null ? ex.getMessage() : "Invalid comparison request",
                null,
                LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

}