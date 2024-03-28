/// <reference types="tree-sitter-cli/dsl" />

/*const csl1 = rule => seq(
  rule,
  repeat(seq(",", rule)),
  optional(","),
);

const csl0 = rule => optional(csl1(rule));*/

module.exports = grammar({
  name: "wit",

  word: $ => $.ident,
  extras: $ => [$._whitespace, $.line_comment, $.block_comment],

  rules: {
    file: $ => seq(
      optional($.package_decl),
      repeat(choice($.toplevel_use_item, $.interface_item, $.world_item))
    ),

    _whitespace: _ => /[ \n\r\t]/,
    line_comment: _ => /\/\/.*\n/,
    block_comment: _ => /\/\*([^*]|\*[^\/])*\*\//,
    ident: _ => /%?[a-z][0-9a-z]*(-[a-z][0-9a-z]*)*/,

    // operators go here

    // keywords go here

    integer: _ => choice("0", /[1-9][0-9]*/),

    package_decl: $ => seq(
      "package",
      field("namespace", $.ident),
      ":",
      field("package", $.ident),
      optional(seq("@", $.semver)),
      ";"
    ),

    semver: $ => seq($.integer, ".", $.integer, ".", $.integer),

    toplevel_use_item: $ => seq(
      "use",
      $.use_path,
      optional(seq("as", $.ident)),
      ";"
    ),

    use_path: $ => choice(
      $.ident,
      seq($.ident, ":", $.ident, "/", $.ident, optional(seq("@", $.semver))),
      // nested use goes here (not part of current WIT)
    ),

    world_item: $ => seq(
      "world",
      field("name", $.ident),
      "{", repeat($.world_items), "}"
    ),

    world_items: $ => choice($.export_item, $.import_item, $.use_item, $.typedef_item, $.include_item),

    export_item: $ => choice(
      seq("export", $.ident, ":", $.extern_type),
      seq("export", $.use_path, ";")
    ),

    import_item: $ => choice(
      seq("import", $.ident, ":", $.extern_type),
      seq("import", $.use_path, ";"),
    ),

    extern_type: $ => choice(
      seq($.func_type, ";"),
      seq("interface", "{", repeat($.interface_items), "}")
    ),

    include_item: $ => choice(
      seq("include", $.use_path, ";"),
      seq("include", $.use_path, "with", "{", $.include_names_list, "}")
    ),

    include_names_list: $ => choice(
      $.include_names_item,
      seq($.include_names_list, ",", $.include_names_item)
    ),

    include_names_item: $ => seq($.ident, "as", $.ident),

    interface_item: $ => seq(
      "interface",
      field("name", $.ident),
      "{", repeat($.interface_items), "}"
    ),

    interface_items: $ => choice($.typedef_item, $.use_item, $.func_item),

    typedef_item: $ => choice(
      $.resource_item,
      $.variant_item,
      $.record_item,
      $.flags_items,
      $.enum_items,
      $.type_item
    ),

    func_item: $ => seq(
      field("name", $.ident),
      ":",
      $.func_type,
      ";"
    ),

    func_type: $ => seq("func", $.param_list, optional($.result_list)),

    param_list: $ => seq("(", optional($.named_type_list), ")"),

    result_list: $ => choice(
      seq("->", $.ty),
      seq("->", "(", $.named_type_list, ")")
    ),

    named_type_list: $ => seq(
      $.named_type,
      repeat(seq(",", $.named_type)),
    ),

    named_type: $ => seq(field("name", $.ident), ":", field("ty", $.ty)),

    use_item: $ => seq("use", $.use_path, ".", "{", $.use_names_list, "}", ";"),

    // TODO comma-separated list shortcut here?
    use_names_list: $ => choice(
      $.use_names_item,
      seq($.use_names_item, ",", optional($.use_names_list)),
    ),

    // TODO highlight fields?
    use_names_item: $ => choice($.ident, seq($.ident, "as", $.ident)),

    type_item: $ => seq(
      "type",
      field("name", $.ident),
      "=",
      $.ty,
      ";"
    ),

    record_item: $ => seq(
      "record",
      field("name", $.ident),
      "{",
      $.record_fields,
      "}"
    ),

    record_fields: $ => choice(
      $.record_field,
      seq($.record_field, ",", optional($.record_fields))
    ),

    record_field: $ => seq(
      field("name", $.ident),
      ":",
      $.ty
    ),

    flags_items: $ => seq(
      "flags",
      field("name", $.ident),
      "{",
      $.flags_fields,
      "}"
    ),

    // TODO csl
    flags_fields: $ => choice(
      $.ident,
      seq($.ident, ",", optional($.flags_fields))
    ),

    // TODO highlight fields
    variant_item: $ => seq(
      "variant",
      field("name", $.ident),
      "{", $.variant_cases, "}"
    ),

    // TODO csl
    variant_cases: $ => choice(
      $.variant_case,
      seq($.variant_case, ",", optional($.variant_cases)),
    ),

    variant_case: $ => seq(
      field("name", $.ident),
      optional(seq("(", $.ty, ")"))
    ),

    enum_items: $ => seq(
      "enum",
      field("name", $.ident),
      "{", $.enum_cases, "}"
    ),

    enum_cases: $ => choice(
      $.ident,
      seq($.ident, ",", optional($.enum_cases))
    ),

    resource_item: $ => seq(
      "resource",
      field("name", $.ident),
      choice(
        ";",
        seq("{", repeat($.resource_method), "}")
      ),
    ),

    resource_method: $ => choice(
      $.func_item,
      $.static_method,
      $.constructor
    ),

    static_method: $ => seq(
      field("name", $.ident),
      ":",
      "static",
      $.func_type,
      ";"
    ),

    constructor: $ => seq("constructor", $.param_list, ";"),

    ty: $ => choice(
      "u8", "u16", "u32", "u64",
      "s8", "s16", "s32", "s64",
      "float32", "float64",
      "char",
      "bool",
      "string",
      $.tuple,
      $.list,
      $.option,
      $.result,
      $.handle
    ),

    tuple: $ => seq("tuple", "<", $.tuple_list, ">"),

    // TODO csl
    tuple_list: $ => choice(
      $.ty,
      seq($.ty, ",", $.tuple_list)
    ),

    tp1: $ => seq("<", $.ty, ">"),

    list: $ => seq("list", $.tp1),

    option: $ => seq("option", $.tp1),

    result: $ => seq("result", optional(choice(
      seq("<", $.ty, ",", $.ty, ">"),
      seq("<", "_", ",", $.ty, ">"),
      $.tp1,
    ))),

    handle: $ => choice(
      $.ident,
      seq("borrow", "<", $.ident, ">")
    ),
  }
});

