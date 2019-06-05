// To build this file execute:
// $ npm run build-parser

start = Comment* roots: (Property / Rule)* { return {roots: roots}; }

__ = [\t\n\r ]+
_ = [\t\n\r ]*

Rule = _ Comment* _ selector: Selector _ body: Body { return {type: "rule", body: body, selector: selector, location: location()}; }

//Selector "Selector" = val: $[^{};]* { return val.trim(); }

Property "Property" = name: $[^:}{]+ _ ":" _ values: SpaceListValue+ _ ";" _ { return {type: "property", values: values, name: name, location: location()}; }

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
    
 	return {properties: properties, rules: rules, location: location()};
 }

Hex = [a-zA-Z0-9]

Comment = "/*" [^*]* "*"+ ([^/*] [^*]* "*"+)* "/"

Unit = "em" / "%" / "px" / "rem" / "ex" / "pc" / "mm" / "ch" / "vw" / "vh" / "vmin" / "vmax" / "pt" / "cm" / "in" / "deg" / "grad" / "rad" / "ms" / "s" / "hz" / "kh" / ""

SpaceListValue = value: (Value / Selector) (__/&";") { return value; }

ListValue = _ value: Value ","? { return value; }

Call = "(" _ values: ListValue* _ ")" { return values; }

Expression = 
    head: Term &_ tails: (_ operator: ("+" / "-") _ value: Term {return {value: value, operator: operator}; })* { return {type: "expression", head: head, tails: tails, location: location()}; }

Term = 
	head: Factor &_ tails: (_ operator: ("*" / "/") _ value: Factor {return {value: value, operator: operator}; })* { return {type: "expression", head: head, tails: tails, location: location()}; }
    
Factor =
	"(" _ exp: Expression _ ")" { return exp; }
	/ PureValue;

Value = Expression;

PureValue
  = 
	numbers: $[0-9.-]+ postfix: Unit { 
    	return {value: parseFloat(numbers), unit: postfix, type: "number", location: location()};
    }
  	/ at: ("@" / "$" / "!")? name: $[a-zA-Z0-9._-]+ call: Call? { return {type: "reference", "prefix": at, name: name, call: call, location: location()}; }
  	/ hex: $("#" ($(Hex Hex Hex Hex Hex Hex) / $(Hex Hex Hex))) { return {type: "hex", value: hex, location: location()}; }
 	/ '"' chars:DoubleStringCharacter* '"' { return {type: "string", value: chars.join(''), location: location()}; }
 	/ "'" chars:SingleStringCharacter* "'" { return {type: "string", value: chars.join(''), location: location()}; }
    / "(" query: $[^)(]* ")" { return {type: "query", value: "(" + query + ")"}; }

Name = $[^\]\[=]+

Id = "#"
Class = "."
Pseudo = ":"
Attribute = "[" _ attributes: (name: Name _ value: ("=" _ value: Value {return value;})? ","? _ { return {name: name, value: value || true}; })* _ "]" { return {type: "attribute", attributes: attributes, location: location()}; }

SliceSpace = __ !"{" {return "whitespace";}

InlineExpression = "{@" value: Value "}" { return value; }

Slice = 
	prefix: ("~" / Id / Class / SliceSpace / Pseudo / "&" / "@") value: (InlineExpression / $[^#.:\[\]}{() \n\r\t]*) postfix: ((calls: Call { return {type: "call", values: calls}; }) / Attribute)* { return {type: "slice", prefix: prefix, value: value, postfix: postfix, location: location()}; }
   	/ InlineExpression

Selector = slices: Slice+ {return {type: "selector", slices: slices, location: location()};}

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