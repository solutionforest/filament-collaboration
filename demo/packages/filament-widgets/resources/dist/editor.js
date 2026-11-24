// packages/filament-widgets/resources/js/editor.js
function e(e) {
	e.registerAdapter("demo-post-composer", {
		format: "text",
		attach({ element: t, changed: n, moved: r }) {
			let i = t.querySelector(".demo-composer-input");
			if (!i) return null;
			let a = new AbortController(), { signal: o } = a, s = !1;
			i.addEventListener("input", n, { signal: o });
			for (let e of [
				"select",
				"keyup",
				"pointerup",
				"focus"
			]) i.addEventListener(e, r, { signal: o });
			return i.addEventListener("compositionstart", () => s = !0, { signal: o }), i.addEventListener("compositionend", () => s = !1, { signal: o }), {
				read: () => i.value,
				write(t) {
					let n = e.minimalChange(i.value, t);
					n && (i.setRangeText(n.insert, n.from, n.to, "preserve"), i.dispatchEvent(new Event("input", { bubbles: !0 })));
				},
				selection: () => {
					let e = i.selectionDirection === "backward";
					return {
						anchor: e ? i.selectionEnd : i.selectionStart,
						head: e ? i.selectionStart : i.selectionEnd
					};
				},
				setSelection: ({ anchor: e, head: t }) => i.setSelectionRange(Math.min(e, t), Math.max(e, t), e > t ? "backward" : "forward"),
				caretRect: (t) => e.caretRect(i, t),
				isFocused: () => document.activeElement === i,
				isBusy: () => s,
				isAlive: () => i.isConnected,
				destroy: () => a.abort()
			};
		}
	}), e.registerAdapter("demo-star-rating", {
		format: "value",
		attach({ element: e, changed: t }) {
			let n = e.querySelector(".demo-rating"), r = n && window.Alpine?.$data(n);
			if (!r || !("state" in r)) return null;
			let i = new AbortController();
			return n.addEventListener("demo-widget-change", t, { signal: i.signal }), {
				read: () => r.state ?? null,
				write: (e) => r.state = e ?? null,
				isFocused: () => n.contains(document.activeElement),
				isAlive: () => n.isConnected,
				destroy: () => i.abort()
			};
		}
	});
}
window.filamentCollaboration ? e(window.filamentCollaboration) : window.addEventListener("filament-collaboration:init", (t) => e(t.detail), { once: !0 });
function t({ type: e, state: t, limit: n = 280, stars: r = 5 }) {
	return {
		type: e,
		state: t,
		limit: n,
		stars: r,
		hover: null,
		init() {
			this.$watch("state", () => this.$el.dispatchEvent(new CustomEvent("demo-widget-change")));
		},
		get remaining() {
			return this.limit - (this.state ?? "").length;
		},
		get ring() {
			let e = Math.min(1, (this.state ?? "").length / this.limit);
			return {
				strokeDashoffset: String(50.3 * (1 - e)),
				stroke: e >= 1 ? "#dc2626" : void 0
			};
		}
	};
}
export { t as default };
