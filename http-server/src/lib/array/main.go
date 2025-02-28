package array

import (
	"errors"
	"fmt"
	"reflect"
	"strconv"
	"strings"
)

func Remove[T any](array []T, index int) []T {
	return append(array[:index], array[index+1:]...)
}

func Map[T any, V any](slice []T, f func(T) V) []V {
	modified := make([]V, len(slice))
	for i, val := range slice {
		modified[i] = f(val)
	}
	return modified
}

func Filter[T any](slice []T, f func(T) bool) []T {
	var result []T
	for _, v := range slice {
		if f(v) {
			result = append(result, v)
		}
	}
	return result
}

func Include[T any](slice []T, value T) bool {
	for _, item := range slice {
		if reflect.DeepEqual(item, value) {
			return true
		}
	}
	return false
}

func ToString[T any](slice []T, sparator string) (string, error) {
	value := reflect.ValueOf(slice)
	if value.Kind() != reflect.Slice {
		return "", fmt.Errorf("input is not a slice")
	}

	var strSlice []string
	for i := 0; i < value.Len(); i++ {
		element := value.Index(i)

		// Convert each element to string
		strSlice = append(strSlice, fmt.Sprintf("%v", element.Interface()))
	}

	// Join the string representations with a comma separator
	result := strings.Join(strSlice, sparator)
	return result, nil
}

func StringToArray[T any](str, separator string, valueType T) []T {
	// Split the string into individual elements
	strValues := strings.Split(str, separator)

	// Get the reflect type of element
	elemType := reflect.TypeOf(valueType)

	// Create a slice of the desired type
	slice := reflect.MakeSlice(reflect.SliceOf(elemType), len(strValues), len(strValues))

	// Convert each string element to the desired type and store in slice
	for i, v := range strValues {
		switch elemType.Kind() {
		case reflect.Int:
			num, _ := strconv.Atoi(v)
			slice.Index(i).SetInt(int64(num))
		case reflect.String:
			slice.Index(i).SetString(v)
		// Add cases for other types as needed
		default:
			panic(fmt.Sprintf("Unsupported type %v", elemType))
		}
	}

	// Convert reflect.Value slice to []T and return
	result := make([]T, slice.Len())
	for i := 0; i < slice.Len(); i++ {
		result[i] = slice.Index(i).Interface().(T)
	}

	return result
}

func Pluck[T any, V any](slice []T, fieldName string, result *[]V) error {
	for _, v := range slice {
		// Use reflection to get the field by name
		rv := reflect.ValueOf(v)

		// Ensure we're working with a struct
		if rv.Kind() != reflect.Struct {
			return errors.New("input slice contains non-struct elements")
		}

		// Get the field by name
		field := rv.FieldByName(fieldName)
		if !field.IsValid() {
			return fmt.Errorf("field %s not found", fieldName)
		}

		// Ensure the field is assignable to the result type
		if field.CanInterface() {
			*result = append(*result, field.Interface().(V))
		} else {
			return fmt.Errorf("field %s is not assignable", fieldName)
		}
	}
	return nil
}
