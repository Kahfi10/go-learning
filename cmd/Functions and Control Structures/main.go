package main
import (
	"errors"
	"fmt"
)


func main() {
	var printValue string = "Hello Kahfi"
	printMe(printValue)

	var numerator int = 10
	var denominator int = 3
	var result, remainder, err = intDivision(numerator, denominator)
	switch {
	case err != nil:
		fmt.Println(err.Error())
	case remainder == 0:
		fmt.Println("The result of the integer division is %v", result)
	default:
		fmt.Println("The result of the integer division is %v with remainder %v", result, remainder)
	}

	switch remainder {
	case 0:
		fmt.Println("The division was exact")
	case 1,2:
		fmt.Println("The division was close")
	default:
		fmt.Println("The division was not close")
	}
}

func printMe(printValue string) {
	fmt.Println(printValue)
}

func intDivision(numerator int, denominator int) (int, int, error) {
	var err error 
	if denominator == 0 {
		err = errors.New("Cannot Divide by Zero")
		return 0, 0, err
	}

	var result int = numerator / denominator
	var remainder int = numerator % denominator
	return  result, remainder, err
}