(line_comment) @comment.line
(block_comment) @comment.block

; TODO different scopes for import and export names?

(package_decl namespace: (ident) @module)
(package_decl package: (ident) @module)
(use_path (ident) @module)
(world_item name: (ident) @module)
(interface_item name: (ident) @module)
(func_item name: (ident) @function)
(named_type name: (ident) @variable.parameter)
(use_names_item (ident) @type)
(type_item name: (ident) @type)
(record_item name: (ident) @type)
(record_field name: (ident) @variable.other.member)
(flags_items name: (ident) @type)
(flags_fields (ident) @constant)
(variant_item name: (ident) @type.enum)
(variant_case name: (ident) @constructor)
(enum_items name: (ident) @type.enum)
(enum_cases (ident) @constant)
(resource_item name: (ident) @type)
(ty) @type
(handle (ident) @type)

[ "constructor" ] @constructor

[
  ; TODO add unit type ("_") into grammar
  ; (unit)

  "u8" "u16" "u32" "u64"
  "s8" "s16" "s32" "s64"
  "float32" "float64"
  "char" "bool" "string"
] @type.builtin

[
  "list"
  "option"
  "result"
  "tuple"
  "borrow"
] @function.macro

[ "." "," ":" ";" ] @punctuation.delimiter
[ "(" ")" "{" "}" "<" ">" ] @punctuation.bracket
[ "=" "->" ] @operator

[
  "world"
  "interface"
] @keyword

[
  "record"
  "flags"
  "variant"
  "enum"
  "type"
  "resource"
] @keyword.storage.type

"func" @keyword

[
  "static"
] @keyword.storage.modifier

[
  ; TODO add star ("*") into grammar
  ; (star)
  "use"
  "as"
  "package"
  "export"
  "import"
] @keyword.control.import
