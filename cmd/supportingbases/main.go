package main

import (
	"fmt"

	_ "supportingbases/pkg/engine"
	_ "supportingbases/pkg/expansion"
	_ "supportingbases/pkg/finance"
	_ "supportingbases/pkg/marketplace"
	_ "supportingbases/pkg/opportunities"
)

func main() {
	fmt.Println("SupportingBases: A new financial ecosystem.")
}
