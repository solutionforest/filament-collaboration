FilamentCollaboration.adapter("demo-post-composer", {
	format: "text",
	attach({ element: e, changed: t, moved: n }) {
		let r = e.querySelector(".demo-composer-input");
		if (!r) return null;
		let i = new AbortController(), { signal: a } = i, o = !1;
		r.addEventListener("input", t, { signal: a });
		for (let e of [
			"select",
			"keyup",
			"pointerup",
			"focus"
		]) r.addEventListener(e, n, { signal: a });
		return r.addEventListener("compositionstart", () => o = !0, { signal: a }), r.addEventListener("compositionend", () => o = !1, { signal: a }), {
			read: () => r.value,
			write(e) {
				let t = FilamentCollaboration.minimalChange(r.value, e);
				t && (r.setRangeText(t.insert, t.from, t.to, "preserve"), r.dispatchEvent(new Event("input", { bubbles: !0 })));
			},
			selection: () => {
				let e = r.selectionDirection === "backward";
				return {
					anchor: e ? r.selectionEnd : r.selectionStart,
					head: e ? r.selectionStart : r.selectionEnd
				};
			},
			setSelection: ({ anchor: e, head: t }) => r.setSelectionRange(Math.min(e, t), Math.max(e, t), e > t ? "backward" : "forward"),
			caretRect: (e) => FilamentCollaboration.caretRect(r, e),
			isFocused: () => document.activeElement === r,
			isBusy: () => o,
			isAlive: () => r.isConnected,
			destroy: () => i.abort()
		};
	}
}), FilamentCollaboration.adapter("demo-star-rating", {
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
function e({ type: e, state: t, limit: n = 280, stars: r = 5 }) {
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
export { e as default };
