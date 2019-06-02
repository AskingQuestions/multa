### Enhanced css
Much like `less` and `sass` Multa supports a set of helpful css additions demonstrated below.
```css
/* demo.multa */

.selector {
	.child-selector {
		background: transparent;
	}
}
```
Outputs:
```css
/* demo.css */

.selector .child-selector {
	background: transparent;
}
```
---
```css
/* demo.multa */

.selector {
	&:hover {

	}

	& > .direct {

	}
}
```
Outputs:
```css
/* demo.css */

.selector:hover {}
.selector > .direct {}
```

### Including other files

```css
/* Injects rules directly into this file */
@import "other.multa";

/* Inserts rules under this selector */
.selector {
	@import "other.multa";
}
```