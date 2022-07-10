
# Naming Conventions

An effort has been made to adhere to the follwing naming conventions.

Local variables and functions are named using the [snake_case](https://en.wikipedia.org/wiki/Snake_case) format.

If a variable or function is meant to have visibility outside of the scope within which it is defined,
then the [PascalCase]() format is used.

When defining complex objects, PascalCase is used for naming objects that serve as "containers" for other
objects and values, while snake_case is used for the primitive elements which actually store values.

Parameter names for function arguments are always in PascalCase.
The function itself may be PascalCase or snake_case, depending on its visibility within the scope.

Variable and function names may be preceeded by an underscore '_' character to denote a certain amount
of obfuscation to the name.
This is also done to avoid clashing with other names in the same scope.
