package main

import (
	"fmt"
	"unicode/utf8"
)

func main() {
    var intNum int = 32676
	intNum = intNum + 1
	fmt.Println(intNum)

	var floatNum float64 = 3.14159
	fmt.Println(floatNum)

	var floatNum32 float32 = 30.2
	var intNum32 int32 = 3
	var result float32 = float32(floatNum32) + float32(intNum32)
	fmt.Println(result)

	var intNum1 int = 10
	var intNum2 int = 3

	fmt.Println(intNum1/intNum2)
	fmt.Println(intNum1%intNum2)

	var mysString string = "Kahfi" + " " + "Ilham"
	fmt.Println(mysString)

	fmt.Println(utf8.RuneCountInString("K"))

	var myRune rune = 'a'
	fmt.Println(myRune)

	var myBoolean bool = true
	fmt.Println(myBoolean)

	var intNum3 rune
	fmt.Println(intNum3)

	var1, var2 := 1, 2
	fmt.Println(var1, var2)

	const myConst string = "Kahfi Ilham"
	fmt.Println(myConst)

	const pi float32 = 3.14
	fmt.Println(pi)


}