class Calculator {
    constructor() {
        this.operationString = "";
        this.OPERATORS = ["+", "-", "x", "*", "/"];
        this.display = document.getElementById("display");
        this.operation = document.getElementById("operation");
        this.switchButton = document.getElementById("switchButton");
        this.numberButtons = document.getElementsByClassName("number");
        this.operatorButtons = document.getElementsByClassName("operator");
        this.AllClearButton = document.getElementById("all-clear");
        this.ClearButton = document.getElementById("clear");
        this.content = document.querySelector("#switchButton .switch");
        this.equalButton = document.getElementById("equals")
        this.power = false;
    }

    init() {
        this.switchButton.addEventListener("click", () => this.switch());
        this.AllClearButton.addEventListener("click", () => this.allClear());
        this.ClearButton.addEventListener("click", () => this.clear());
        this.equalButton.addEventListener("click", () => this.equals());
        // this.switch(); //if this is called, the calculator will be turned on by default
        this.addEventListeners();
    }

    switch() {
        this.power = !this.power;
        this.switchButton.classList.toggle("clicked");
        this.content.classList.toggle("on");

        for (let i = 0; i < this.numberButtons.length; i++) {
            this.numberButtons[i].classList.toggle("shiny");
        }

        if (!this.power) {
            this.content.children[0].textContent = "Off";
            this.display.setAttribute("readonly", "readonly");
            this.display.removeAttribute("placeholder");

        } else {
            this.content.children[0].textContent = "On";
            this.display.removeAttribute("readonly");
            this.display.setAttribute("placeholder", "0");
        }
        this.display.value = this.operation.textContent = this.operationString = "";
    }

    operationStringChangeDetector(action, payload = null, calculate = false) {
        if (this.power) {
            switch (action) {
                case "push":
                    if (this.validation.isEmpty() && this.validation.payloadIsZero(payload)) return;
                    this.operationString += payload;
                    break;

                case "pop":
                    this.validation.deleteLastElement();
                    break;

                case "exact-value":
                    //this case is used when the user inputs a value via keyboard
                    this.operationString = payload;
                    this.validation.fixConsecutiveOperators();
                    break;

                case "allClear":
                    this.operationString = "";
                    break;

                default:
                    break;
            }

            this.operationString = this.operationString.replace("*", "x");
            this.display.value = this.operationString;
            if (!calculate) { this.operation.textContent = this.operationString; } //the result is displayed but operation history stays still
        }
    }

    numberClicked(number) {
        if (this.validation.lastElementIsDot() && this.validation.payloadIsDot(number)) return;
        this.operationStringChangeDetector("push", number);
    }

    operatorClicked(operator) {
        if (this.validation.lastElementIsOperator()) {
            this.operationStringChangeDetector("pop"); //clear old operator
            this.operationStringChangeDetector("push", operator); //add new operator

        } else if (this.validation.isEmpty() && operator === "-") {
            this.operationStringChangeDetector("push", operator); //add negative sign
            return;

        } else if (this.validation.isEmpty()) {
            return;
        }
        else {
            this.operationStringChangeDetector("push", operator);
        }
    }

    addEventListeners() {
        //clicking number buttons
        for (let i = 0; i < this.numberButtons.length; i++) {
            this.numberButtons[i].addEventListener("click", () => this.numberClicked(this.numberButtons[i].textContent));
        }
        //clicking operators
        for (let i = 0; i < this.operatorButtons.length; i++) {
            this.operatorButtons[i].addEventListener("click", () => this.operatorClicked(this.operatorButtons[i].textContent));
        }
        //pressing enter key
        this.display.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !this.validation.isEmpty()) {
                this.equals()
            }
        });
        //input via keyboard
        this.display.addEventListener("input", (e) => {

            if ((this.validation.payloadIsNumber(e.data) || this.validation.payloadIsDot(e.data) || this.validation.payloadIsOperator(e.data)) && !this.validation.payloadIsSpace(e.data)) {
                if (this.validation.isEmpty() && this.validation.payloadIsOperator(e.data)) {

                    if (e.data === "-") {
                        this.operationStringChangeDetector("push", e.data);
                    }
                    this.display.value = this.operationString;
                    return;

                } else if (this.validation.payloadIsOperator(e.data) && this.validation.lastElementIsOperator()) {
                    this.operationStringChangeDetector("pop");
                    this.operationStringChangeDetector("push", e.data);
                    return;
                }

                if (e.data == "*") {
                    this.operationStringChangeDetector("exact-value", this.display.value.replace("*", "x"));
                } else {
                    this.operationStringChangeDetector("exact-value", this.display.value);
                }
            } else {
                this.display.value = this.operationString;
            }
        });
    }

    allClear() {
        this.operationStringChangeDetector("allClear");
    }

    clear() {
        this.operationStringChangeDetector("pop");
    }

    isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
    }

    calculate() {
        if (this.validation.lastElementIsDot() || this.validation.lastElementIsOperator()) {
            this.validation.deleteLastElement();
        }
        this.operationString = this.operationString.replaceAll("x", "*");

        let result = Function(`return (${this.operationString})`)();
        if (this.validation.resultIsInfinity(result)) {
            return "∞";
        }
        if (this.isFloat(result)) {
            result = result.toFixed(3);
        }
        return result;
    }

    equals() {
        if (this.validation.isEmpty()) return;
        this.operationStringChangeDetector("exact-value", this.calculate().toString(), true);
    }

    //validation helper object to validate special cases
    validation = {

        //check if operation string is empty
        isEmpty: () => {
            if (this.operationString.length === 0) {
                return true;
            }
            return false;
        },
        //when payload is "0" or "00"
        payloadIsZero: (data) => {
            if (data == "0" || data == "00") {
                return true;
            }
            return false;
        },
        //when payload is an operator
        payloadIsOperator: (data) => {
            if (this.OPERATORS.includes(data)) {
                return true;
            }
            return false;
        },
        //when payload is a number
        payloadIsNumber: (data) => {
            if (data >= 0 && data <= 9) {
                return true;
            }
            return false;
        },
        //when payload is "."
        payloadIsDot: (data) => {
            if (data == ".") {
                return true;
            }
            return false;
        },
        //when payload is empty
        payloadIsSpace: (data) => {
            if (data == " ") {
                return true;
            }
            return false;
        },
        //when last element is "."
        lastElementIsDot: () => {
            if (this.operationString[this.operationString.length - 1] == ".") {
                return true;
            }
            return false;
        },
        //when the last element of operation string is an operator
        lastElementIsOperator: (data) => {
            if (this.OPERATORS.includes(this.operationString[this.operationString.length - 1])) {
                return true;
            }
            return false;
        },
        //delete last element of operation string
        deleteLastElement: () => {
            this.operationString = this.operationString.slice(0, -1);
        },
        //when opeartion string includes consecutive operators
        fixConsecutiveOperators: () => {
            for (let i = 0; i < this.operationString.length; i++) {
                if (this.validation.payloadIsOperator(this.operationString[i]) && this.validation.payloadIsOperator(this.operationString[i + 1])) {
                    this.operationStringChangeDetector("exact-value", this.operationString.replace(this.operationString[i + 1], ""));
                }
            }
        },
        //when the result is infinity
        resultIsInfinity: (result) => {
            if (result == Infinity) {
                return true;
            }
            return false;
        }
    }
}
const calculator = new Calculator();
calculator.init();

