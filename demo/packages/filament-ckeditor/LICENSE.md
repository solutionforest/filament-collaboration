# Licence

This demo package's own code is written to show how a third-party editor is made live with
[filament-collaboration](../../../README.md). Its built bundle, `resources/dist/`, includes
**CKEditor 5**, which is licensed under the **GNU General Public License, version 2 or later**
(GPL-2.0-or-later). The package as distributed is therefore GPL-2.0-or-later.

The editor runs with the `gpl` licence key, which CKEditor 5 provides for open-source use under the
GPL. Using CKEditor 5 in a product that is not GPL-compatible needs a commercial licence from its
vendor: https://ckeditor.com/legal/ckeditor-licensing-options/

The source of CKEditor 5 is on npm and in its vendor's repository; `npm run build:editors` in
`demo/` builds the bundle from it.

The filament-collaboration package itself, in the repository root, is MIT-licensed and does not
include this demo: `demo/` is excluded from what Composer installs.
