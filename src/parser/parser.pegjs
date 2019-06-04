// To build this file execute:
// $ npm run build-parser

start = (Rule / Property)*

__ = [\t\n\r ]+
_ = [\t\n\r ]*

Rule = _ selector: Selector _ body: Body { return {type: "rule", body: body, selector: selector}; }

Selector "Selector" = val: $[^{};]* { return val.trim(); }

Property "Property" = name: $[^:}{]+ _ ":" _ values: ListValue+ _ ";" _ { return {type: "property", values: values, name: name}; }

Body = "{" _ subs: (Rule / Property)* _ "}"
 {
 	let rules = [];
    let properties = [];
    
    for (let sub of subs) {
    	if (sub.type == "rule")
        	rules.push(sub);
        else
        	properties.push(sub);
    }
    
 	return {properties: properties, rules: rules};
 }

Hex = [a-zA-Z0-9]

Unit = "em" / "%" / "px" / "rem" / "ex" / "pc" / "mm" / "ch" / "vw" / "vh" / "vmin" / "vmax" / "pt" / "cm" / "in" / ""

ListValue = _ value: Value ","? { return value; }

Call = "(" _ values: ListValue* _ ")" { return values; }

Value
  = 
  	at: ("@" / "$" / "!")? name: $[a-zA-Z0-9._-]+ call: Call? { return {type: "reference", "prefix": at, name: name, call: call}; }
  	/ hex: $("#" ($(Hex Hex Hex Hex Hex Hex) / $(Hex Hex Hex))) { return {type: "hex", value: hex}; }
  	/ numbers: $[0-9.-]+ postfix: Unit { 
    	return {value: parseFloat(numbers), unit: postfix, type: "number"};
    }
 	/ '"' chars:DoubleStringCharacter* '"' { return {type: "string", value: chars.join('')}; }
 	/ "'" chars:SingleStringCharacter* "'" { return {type: "string", value: chars.join('')}; }

DoubleStringCharacter
  = !('"' / "\\") char:. { return char; }
  / "\\" sequence:EscapeSequence { return sequence; }

SingleStringCharacter
  = !("'" / "\\") char:. { return char; }
  / "\\" sequence:EscapeSequence { return sequence; }

EscapeSequence
  = "'"
  / '"'
  / "\\"
  / "b"  { return "\b";   }
  / "f"  { return "\f";   }
  / "n"  { return "\n";   }
  / "r"  { return "\r";   }
  / "t"  { return "\t";   }
  / "v"  { return "\x0B"; }