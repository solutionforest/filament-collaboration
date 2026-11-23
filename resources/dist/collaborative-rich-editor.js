// node_modules/lib0/map.js
var e = () => /* @__PURE__ */ new Map(), t = (t) => {
	let n = e();
	return t.forEach((e, t) => {
		n.set(t, e);
	}), n;
}, n = (e, t, n) => {
	let r = e.get(t);
	return r === void 0 && e.set(t, r = n()), r;
}, r = (e, t) => {
	let n = [];
	for (let [r, i] of e) n.push(t(i, r));
	return n;
}, i = (e, t) => {
	for (let [n, r] of e) if (t(r, n)) return !0;
	return !1;
}, a = () => /* @__PURE__ */ new Set(), o = (e) => e[e.length - 1], s = (e, t) => {
	for (let n = 0; n < t.length; n++) e.push(t[n]);
}, c = Array.from, l = (e, t) => {
	for (let n = 0; n < e.length; n++) if (!t(e[n], n, e)) return !1;
	return !0;
}, u = (e, t) => {
	for (let n = 0; n < e.length; n++) if (t(e[n], n, e)) return !0;
	return !1;
}, d = (e, t) => {
	let n = Array(e);
	for (let r = 0; r < e; r++) n[r] = t(r, n);
	return n;
}, f = Array.isArray, p = class {
	constructor() {
		this._observers = e();
	}
	on(e, t) {
		return n(this._observers, e, a).add(t), t;
	}
	once(e, t) {
		let n = (...r) => {
			this.off(e, n), t(...r);
		};
		this.on(e, n);
	}
	off(e, t) {
		let n = this._observers.get(e);
		n !== void 0 && (n.delete(t), n.size === 0 && this._observers.delete(e));
	}
	emit(t, n) {
		return c((this._observers.get(t) || e()).values()).forEach((e) => e(...n));
	}
	destroy() {
		this._observers = e();
	}
}, m = Math.floor, h = Math.abs, g = (e, t) => e < t ? e : t, _ = (e, t) => e > t ? e : t;
Number.isNaN;
var ee = (e) => e === 0 ? 1 / e < 0 : e < 0, te = 1 << 29, v = 2 ** 53 - 1, y = -(2 ** 53 - 1), ne = Number.isInteger || ((e) => typeof e == "number" && isFinite(e) && m(e) === e);
Number.isNaN, Number.parseInt;
// node_modules/lib0/string.js
var re = String.fromCharCode;
String.fromCodePoint, re(65535);
var ie = (e) => e.toLowerCase(), ae = /^\s*/g, oe = (e) => e.replace(ae, ""), se = /([A-Z])/g, ce = (e, t) => oe(e.replace(se, (e) => `${t}${ie(e)}`)), le = (e) => {
	let t = unescape(encodeURIComponent(e)), n = t.length, r = new Uint8Array(n);
	for (let e = 0; e < n; e++) r[e] = t.codePointAt(e);
	return r;
}, ue = typeof TextEncoder < "u" ? new TextEncoder() : null, de = ue ? (e) => ue.encode(e) : le, fe = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8", {
	fatal: !0,
	ignoreBOM: !0
});
/* c8 ignore start */
fe && fe.decode(/* @__PURE__ */ new Uint8Array()).length === 1 && 
/* c8 ignore next */
(fe = null);
var pe = (e, t) => d(t, () => e).join(""), me = class {
	constructor() {
		this.cpos = 0, this.cbuf = /* @__PURE__ */ new Uint8Array(100), this.bufs = [];
	}
}, he = () => new me(), ge = (e) => {
	let t = he();
	return e(t), ve(t);
}, _e = (e) => {
	let t = e.cpos;
	for (let n = 0; n < e.bufs.length; n++) t += e.bufs[n].length;
	return t;
}, ve = (e) => {
	let t = new Uint8Array(_e(e)), n = 0;
	for (let r = 0; r < e.bufs.length; r++) {
		let i = e.bufs[r];
		t.set(i, n), n += i.length;
	}
	return t.set(new Uint8Array(e.cbuf.buffer, 0, e.cpos), n), t;
}, ye = (e, t) => {
	let n = e.cbuf.length;
	n - e.cpos < t && (e.bufs.push(new Uint8Array(e.cbuf.buffer, 0, e.cpos)), e.cbuf = new Uint8Array(_(n, t) * 2), e.cpos = 0);
}, b = (e, t) => {
	let n = e.cbuf.length;
	e.cpos === n && (e.bufs.push(e.cbuf), e.cbuf = new Uint8Array(n * 2), e.cpos = 0), e.cbuf[e.cpos++] = t;
}, be = b, x = (e, t) => {
	for (; t > 127;) b(e, 128 | 127 & t), t = m(t / 128);
	b(e, 127 & t);
}, xe = (e, t) => {
	let n = ee(t);
	for (n && (t = -t), b(e, (t > 63 ? 128 : 0) | (n ? 64 : 0) | 63 & t), t = m(t / 64); t > 0;) b(e, (t > 127 ? 128 : 0) | 127 & t), t = m(t / 128);
}, Se = /* @__PURE__ */ new Uint8Array(3e4), Ce = Se.length / 3, we = ue && ue.encodeInto ? (e, t) => {
	if (t.length < Ce) {
		/* c8 ignore next */
		let n = ue.encodeInto(t, Se).written || 0;
		x(e, n);
		for (let t = 0; t < n; t++) b(e, Se[t]);
	} else Ee(e, de(t));
} : (e, t) => {
	let n = unescape(encodeURIComponent(t)), r = n.length;
	x(e, r);
	for (let t = 0; t < r; t++) b(e, n.codePointAt(t));
}, Te = (e, t) => {
	let n = e.cbuf.length, r = e.cpos, i = g(n - r, t.length), a = t.length - i;
	e.cbuf.set(t.subarray(0, i), r), e.cpos += i, a > 0 && (e.bufs.push(e.cbuf), e.cbuf = new Uint8Array(_(n * 2, a)), e.cbuf.set(t.subarray(i)), e.cpos = a);
}, Ee = (e, t) => {
	x(e, t.byteLength), Te(e, t);
}, De = (e, t) => {
	ye(e, t);
	let n = new DataView(e.cbuf.buffer, e.cpos, t);
	return e.cpos += t, n;
}, Oe = (e, t) => De(e, 4).setFloat32(0, t, !1), ke = (e, t) => De(e, 8).setFloat64(0, t, !1), Ae = (e, t) => De(e, 8).setBigInt64(0, t, !1), je = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(4)), Me = (e) => (je.setFloat32(0, e), je.getFloat32(0) === e), Ne = (e, t) => {
	switch (typeof t) {
		case "string":
			b(e, 119), we(e, t);
			break;
		case "number":
			ne(t) && h(t) <= 2147483647 ? (b(e, 125), xe(e, t)) : Me(t) ? (b(e, 124), Oe(e, t)) : (b(e, 123), ke(e, t));
			break;
		case "bigint":
			b(e, 122), Ae(e, t);
			break;
		case "object":
			if (t === null) b(e, 126);
			else if (f(t)) {
				b(e, 117), x(e, t.length);
				for (let n = 0; n < t.length; n++) Ne(e, t[n]);
			} else if (t instanceof Uint8Array) b(e, 116), Ee(e, t);
			else {
				b(e, 118);
				let n = Object.keys(t);
				x(e, n.length);
				for (let r = 0; r < n.length; r++) {
					let i = n[r];
					we(e, i), Ne(e, t[i]);
				}
			}
			break;
		case "boolean":
			b(e, t ? 120 : 121);
			break;
		default: b(e, 127);
	}
}, Pe = class extends me {
	constructor(e) {
		super(), this.w = e, this.s = null, this.count = 0;
	}
	write(e) {
		this.s === e ? this.count++ : (this.count > 0 && x(this, this.count - 1), this.count = 1, this.w(this, e), this.s = e);
	}
}, Fe = (e) => {
	e.count > 0 && (xe(e.encoder, e.count === 1 ? e.s : -e.s), e.count > 1 && x(e.encoder, e.count - 2));
}, Ie = class {
	constructor() {
		this.encoder = new me(), this.s = 0, this.count = 0;
	}
	write(e) {
		this.s === e ? this.count++ : (Fe(this), this.count = 1, this.s = e);
	}
	toUint8Array() {
		return Fe(this), ve(this.encoder);
	}
}, Le = (e) => {
	if (e.count > 0) {
		let t = e.diff * 2 + (e.count === 1 ? 0 : 1);
		xe(e.encoder, t), e.count > 1 && x(e.encoder, e.count - 2);
	}
}, Re = class {
	constructor() {
		this.encoder = new me(), this.s = 0, this.count = 0, this.diff = 0;
	}
	write(e) {
		this.diff === e - this.s ? (this.s = e, this.count++) : (Le(this), this.count = 1, this.diff = e - this.s, this.s = e);
	}
	toUint8Array() {
		return Le(this), ve(this.encoder);
	}
}, ze = class {
	constructor() {
		this.sarr = [], this.s = "", this.lensE = new Ie();
	}
	write(e) {
		this.s += e, this.s.length > 19 && (this.sarr.push(this.s), this.s = ""), this.lensE.write(e.length);
	}
	toUint8Array() {
		let e = new me();
		return this.sarr.push(this.s), this.s = "", we(e, this.sarr.join("")), Te(e, this.lensE.toUint8Array()), ve(e);
	}
}, Be = (e) => Error(e), Ve = () => {
	throw Be("Method unimplemented");
}, S = () => {
	throw Be("Unexpected case");
}, He = Be("Unexpected end of array"), Ue = Be("Integer out of Range"), We = (e, t, n) => {
	if (t < 0 || n < 0 || t + n > e.length) throw He;
	return new Uint8Array(e.buffer, e.byteOffset + t, n);
}, Ge = (e, t, n) => {
	if (t < 0 || n < 0 || t + n > e.length) throw He;
	return new DataView(e.buffer, e.byteOffset + t, n);
}, Ke = class {
	constructor(e) {
		this.arr = e, this.pos = 0;
	}
}, qe = (e) => new Ke(e), Je = (e) => e.pos !== e.arr.length, Ye = (e, t) => {
	let n = We(e.arr, e.pos, t);
	return e.pos += t, n;
}, Xe = (e) => Ye(e, C(e)), Ze = (e) => e.arr[e.pos++], C = (e) => {
	let t = 0, n = 1, r = e.arr.length;
	for (; e.pos < r;) {
		let r = e.arr[e.pos++];
		if (t += (r & 127) * n, n *= 128, r < 128) return t;
		/* c8 ignore start */
		if (t > v) throw Ue;
	}
	throw He;
}, Qe = (e) => {
	let t = e.arr[e.pos++], n = t & 63, r = 64, i = (t & 64) > 0 ? -1 : 1;
	if (!(t & 128)) return i * n;
	let a = e.arr.length;
	for (; e.pos < a;) {
		if (t = e.arr[e.pos++], n += (t & 127) * r, r *= 128, t < 128) return i * n;
		/* c8 ignore start */
		if (n > v) throw Ue;
	}
	throw He;
}, $e = fe ? (e) => fe.decode(Xe(e)) : (e) => {
	let t = C(e);
	if (t === 0) return "";
	{
		let n = String.fromCodePoint(Ze(e));
		if (--t < 100) for (; t--;) n += String.fromCodePoint(Ze(e));
		else for (; t > 0;) {
			let r = t < 1e4 ? t : 1e4, i = e.arr.subarray(e.pos, e.pos + r);
			e.pos += r, n += String.fromCodePoint.apply(null, i), t -= r;
		}
		return decodeURIComponent(escape(n));
	}
}, et = (e, t) => {
	let n = Ge(e.arr, e.pos, t);
	return e.pos += t, n;
}, tt = [
	(e) => void 0,
	(e) => null,
	Qe,
	(e) => et(e, 4).getFloat32(0, !1),
	(e) => et(e, 8).getFloat64(0, !1),
	(e) => et(e, 8).getBigInt64(0, !1),
	(e) => !1,
	(e) => !0,
	$e,
	(e) => {
		let t = C(e), n = {};
		for (let r = 0; r < t; r++) {
			let t = $e(e);
			n[t] = nt(e);
		}
		return n;
	},
	(e) => {
		let t = C(e), n = [];
		for (let r = 0; r < t; r++) n.push(nt(e));
		return n;
	},
	Xe
], nt = (e) => tt[127 - Ze(e)](e), rt = class extends Ke {
	constructor(e, t) {
		super(e), this.reader = t, this.s = null, this.count = 0;
	}
	read() {
		return this.count === 0 && (this.s = this.reader(this), this.count = Je(this) ? C(this) + 1 : -1), this.count--, this.s;
	}
}, it = class extends Ke {
	constructor(e) {
		super(e), this.s = 0, this.count = 0;
	}
	read() {
		if (this.count === 0) {
			this.s = Qe(this);
			let e = ee(this.s);
			this.count = 1, e && (this.s = -this.s, this.count = C(this) + 2);
		}
		return this.count--, this.s;
	}
}, at = class extends Ke {
	constructor(e) {
		super(e), this.s = 0, this.count = 0, this.diff = 0;
	}
	read() {
		if (this.count === 0) {
			let e = Qe(this), t = e & 1;
			this.diff = m(e / 2), this.count = 1, t && (this.count = C(this) + 2);
		}
		return this.s += this.diff, this.count--, this.s;
	}
}, ot = class {
	constructor(e) {
		this.decoder = new it(e), this.str = $e(this.decoder), this.spos = 0;
	}
	read() {
		let e = this.spos + this.decoder.read(), t = this.str.slice(this.spos, e);
		return this.spos = e, t;
	}
};
crypto.subtle;
var st = crypto.getRandomValues.bind(crypto), ct = Math.random, lt = () => st(/* @__PURE__ */ new Uint32Array(1))[0], ut = (e) => e[m(ct() * e.length)], dt = "10000000-1000-4000-8000-100000000000", ft = () => dt.replace(/[018]/g, (e) => (e ^ lt() & 15 >> e / 4).toString(16)), pt = Date.now, mt = (e) => new Promise(e);
Promise.all.bind(Promise);
// node_modules/lib0/conditions.js
/* c8 ignore next */
var ht = (e) => e === void 0 ? null : e, gt = new class {
	constructor() {
		this.map = /* @__PURE__ */ new Map();
	}
	setItem(e, t) {
		this.map.set(e, t);
	}
	getItem(e) {
		return this.map.get(e);
	}
}();
/* c8 ignore start */
try {
	typeof window < "u" && typeof localStorage < "u" && localStorage && (gt = localStorage);
} catch {}
/* c8 ignore stop */
/* c8 ignore next */
var _t = gt, vt = Symbol("Equality"), yt = (e, t) => e === t || !!e?.[vt]?.(t) || !1, bt = (e) => typeof e == "object", xt = Object.assign, St = Object.keys, Ct = (e, t) => {
	for (let n in e) t(e[n], n);
}, wt = (e) => St(e).length, Tt = (e) => {
	for (let t in e) return !1;
	return !0;
}, Et = (e, t) => {
	for (let n in e) if (!t(e[n], n)) return !1;
	return !0;
}, Dt = (e, t) => Object.prototype.hasOwnProperty.call(e, t), Ot = (e, t) => e === t || wt(e) === wt(t) && Et(e, (e, n) => (e !== void 0 || Dt(t, n)) && yt(t[n], e)), kt = Object.freeze, At = (e) => {
	for (let t in e) {
		let n = e[t];
		(typeof n == "object" || typeof n == "function") && At(e[t]);
	}
	return kt(e);
}, jt = (e, t, n = 0) => {
	try {
		for (; n < e.length; n++) e[n](...t);
	} finally {
		n < e.length && jt(e, t, n + 1);
	}
}, Mt = (e, t) => {
	if (e === t) return !0;
	if (e == null || t == null || e.constructor !== t.constructor && (e.constructor || Object) !== (t.constructor || Object)) return !1;
	if (e[vt] != null) return e[vt](t);
	switch (e.constructor) {
		case ArrayBuffer: e = new Uint8Array(e), t = new Uint8Array(t);
		case Uint8Array:
			if (e.byteLength !== t.byteLength) return !1;
			for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
			break;
		case Set:
			if (e.size !== t.size) return !1;
			for (let n of e) if (!t.has(n)) return !1;
			break;
		case Map:
			if (e.size !== t.size) return !1;
			for (let n of e.keys()) if (!t.has(n) || !Mt(e.get(n), t.get(n))) return !1;
			break;
		case void 0:
		case Object:
			if (wt(e) !== wt(t)) return !1;
			for (let n in e) if (!Dt(e, n) || !Mt(e[n], t[n])) return !1;
			break;
		case Array:
			if (e.length !== t.length) return !1;
			for (let n = 0; n < e.length; n++) if (!Mt(e[n], t[n])) return !1;
			break;
		default: return !1;
	}
	return !0;
}, Nt = (e, t) => t.includes(e), Pt = typeof process < "u" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process < "u" ? process : 0) === "[object process]", Ft = typeof window < "u" && typeof document < "u" && !Pt;
typeof navigator < "u" && /Mac/.test(navigator.platform);
var It, Lt = [], Rt = () => {
	if (It === void 0) {
		if (Pt) {
			It = e();
			let t = process.argv, n = null;
			for (let e = 0; e < t.length; e++) {
				let r = t[e];
				r[0] === "-" ? (n !== null && It.set(n, ""), n = r) : n === null ? Lt.push(r) : (It.set(n, r), n = null);
			}
			n !== null && It.set(n, "");
		} else typeof location == "object" ? (It = e(), (location.search || "?").slice(1).split("&").forEach((e) => {
			if (e.length !== 0) {
				let [t, n] = e.split("=");
				It.set(`--${ce(t, "-")}`, n), It.set(`-${ce(t, "-")}`, n);
			}
		})) : It = e();
	}
	return It;
}, zt = (e) => Rt().has(e), Bt = (e) => ht(Pt ? process.env[e.toUpperCase().replaceAll("-", "_")] : _t.getItem(e)), Vt = (e) => zt("--" + e) || Bt(e) !== null, Ht = Vt("production"), Ut = Pt && Nt(process.env.FORCE_COLOR, [
	"true",
	"1",
	"2"
]) || !zt("--no-colors") && !Vt("no-color") && (!Pt || process.stdout.isTTY) && (!Pt || zt("--color") || Bt("COLORTERM") !== null || (Bt("TERM") || "").includes("color")), Wt = (e) => new Uint8Array(e), Gt = Ft ? (e) => {
	let t = "";
	for (let n = 0; n < e.byteLength; n++) t += re(e[n]);
	return btoa(t);
} : (e) => Buffer.from(e.buffer, e.byteOffset, e.byteLength).toString("base64"), Kt = (e) => {
	let t = Wt(e.byteLength);
	return t.set(e), t;
}, qt = (e) => ge((t) => Ne(t, e)), Jt = class {
	constructor(e, t) {
		this.left = e, this.right = t;
	}
}, Yt = (e, t) => new Jt(e, t), Xt = (e) => e.next() >= .5, Zt = (e, t, n) => m(e.next() * (n + 1 - t) + t), Qt = (e, t, n) => m(e.next() * (n + 1 - t) + t), $t = (e, t, n) => Qt(e, t, n), en = (e) => re($t(e, 97, 122)), tn = (e, t = 0, n = 20) => {
	let r = $t(e, t, n), i = "";
	for (let t = 0; t < r; t++) i += en(e);
	return i;
}, nn = (e, t) => t[$t(e, 0, t.length - 1)], rn = Symbol("0schema"), an = class {
	constructor() {
		this._rerrs = [];
	}
	extend(e, t, n, r = null) {
		this._rerrs.push({
			path: e,
			expected: t,
			has: n,
			message: r
		});
	}
	toString() {
		let e = [];
		for (let t = this._rerrs.length - 1; t > 0; t--) {
			let n = this._rerrs[t];
			/* c8 ignore next */
			e.push(pe(" ", (this._rerrs.length - t) * 2) + `${n.path == null ? "" : `[${n.path}] `}${n.has} doesn't match ${n.expected}. ${n.message}`);
		}
		return e.join("\n");
	}
}, on = (e, t) => e === t ? !0 : e == null || t == null || e.constructor !== t.constructor ? !1 : e[vt] ? yt(e, t) : f(e) ? l(e, (e) => u(t, (t) => on(e, t))) : bt(e) ? Et(e, (e, n) => on(e, t[n])) : !1, sn = class {
	static _dilutes = !1;
	extends(e) {
		let [t, n] = [this.shape, e.shape];
		return this.constructor._dilutes && ([n, t] = [t, n]), on(t, n);
	}
	equals(e) {
		return this.constructor === e.constructor && Mt(this.shape, e.shape);
	}
	[rn]() {
		return !0;
	}
	[vt](e) {
		return this.equals(e);
	}
	validate(e) {
		return this.check(e);
	}
	/* c8 ignore start */
	check(e, t) {
		Ve();
	}
	/* c8 ignore stop */
	get nullable() {
		return Rn(this, $n);
	}
	get optional() {
		return new gn(this);
	}
	cast(e) {
		return rr(e, this), e;
	}
	expect(e) {
		return rr(e, this), e;
	}
}, cn = class extends sn {
	constructor(e, t) {
		super(), this.shape = e, this._c = t;
	}
	check(e, t = void 0) {
		let n = e?.constructor === this.shape && (this._c == null || this._c(e));
		return !n && t?.extend(null, this.shape.name, e?.constructor.name, e?.constructor === this.shape ? "Check failed" : "Constructor match failed"), n;
	}
}, w = (e, t = null) => new cn(e, t);
w(cn);
var ln = class extends sn {
	constructor(e) {
		super(), this.shape = e;
	}
	check(e, t) {
		let n = this.shape(e);
		return !n && t?.extend(null, "custom prop", e?.constructor.name, "failed to check custom prop"), n;
	}
}, T = (e) => new ln(e);
w(ln);
var un = class extends sn {
	constructor(e) {
		super(), this.shape = e;
	}
	check(e, t) {
		let n = this.shape.some((t) => t === e);
		return !n && t?.extend(null, this.shape.join(" | "), e.toString()), n;
	}
}, dn = (...e) => new un(e), fn = w(un), pn = RegExp.escape || ((e) => e.replace(/[().|&,$^[\]]/g, (e) => "\\" + e)), mn = (e) => {
	if (Jn.check(e)) return [pn(e)];
	if (fn.check(e)) return e.shape.map((e) => e + "");
	if (qn.check(e)) return ["[+-]?\\d+.?\\d*"];
	if (Yn.check(e)) return [".*"];
	if (zn.check(e)) return e.shape.map(mn).flat(1);
	/* c8 ignore next 2 */
	S();
};
w(class extends sn {
	constructor(e) {
		super(), this.shape = e, this._r = RegExp("^" + e.map(mn).map((e) => `(${e.join("|")})`).join("") + "$");
	}
	check(e, t) {
		let n = this._r.exec(e) != null;
		return !n && t?.extend(null, this._r.toString(), e.toString(), "String doesn't match string template."), n;
	}
});
var hn = Symbol("optional"), gn = class extends sn {
	constructor(e) {
		super(), this.shape = e;
	}
	check(e, t) {
		let n = e === void 0 || this.shape.check(e);
		return !n && t?.extend(null, "undefined (optional)", "()"), n;
	}
	get [hn]() {
		return !0;
	}
}, _n = w(gn), vn = class extends sn {
	check(e, t) {
		return t?.extend(null, "never", typeof e), !1;
	}
};
new vn(), w(vn);
var yn = class e extends sn {
	constructor(e, t = !1) {
		super(), this.shape = e, this._isPartial = t;
	}
	static _dilutes = !0;
	get partial() {
		return new e(this.shape, !0);
	}
	check(e, t) {
		return e == null ? 
		/* c8 ignore next */
		(t?.extend(null, "object", "null"), !1) : Et(this.shape, (n, r) => {
			let i = this._isPartial && !Dt(e, r) || n.check(e[r], t);
			return !i && t?.extend(r.toString(), n.toString(), typeof e[r], "Object property does not match"), i;
		});
	}
}, bn = (e) => new yn(e), xn = w(yn), Sn = T((e) => e != null && (e.constructor === Object || e.constructor == null)), Cn = class extends sn {
	constructor(e, t) {
		super(), this.shape = {
			keys: e,
			values: t
		};
	}
	check(e, t) {
		return e != null && Et(e, (n, r) => {
			let i = this.shape.keys.check(r, t);
			return !i && t?.extend(r + "", "Record", typeof e, i ? "Key doesn't match schema" : "Value doesn't match value"), i && this.shape.values.check(n, t);
		});
	}
}, wn = (e, t) => new Cn(e, t), Tn = w(Cn), En = class extends sn {
	constructor(e) {
		super(), this.shape = e;
	}
	check(e, t) {
		return e != null && Et(this.shape, (n, r) => {
			let i = n.check(e[r], t);
			return !i && t?.extend(r.toString(), "Tuple", typeof n), i;
		});
	}
}, Dn = (...e) => new En(e);
w(En);
var On = class extends sn {
	constructor(e) {
		super(), this.shape = e.length === 1 ? e[0] : new Ln(e);
	}
	check(e, t) {
		let n = f(e) && l(e, (e) => this.shape.check(e));
		return !n && t?.extend(null, "Array", ""), n;
	}
}, kn = (...e) => new On(e), An = w(On), jn = T((e) => f(e)), Mn = class extends sn {
	constructor(e, t) {
		super(), this.shape = e, this._c = t;
	}
	check(e, t) {
		let n = e instanceof this.shape && (this._c == null || this._c(e));
		return !n && t?.extend(null, this.shape.name, e?.constructor.name), n;
	}
}, Nn = (e, t = null) => new Mn(e, t);
w(Mn);
var Pn = Nn(sn), Fn = w(class extends sn {
	constructor(e) {
		super(), this.len = e.length - 1, this.args = Dn(...e.slice(-1)), this.res = e[this.len];
	}
	check(e, t) {
		let n = e.constructor === Function && e.length <= this.len;
		return !n && t?.extend(null, "function", typeof e), n;
	}
}), In = T((e) => typeof e == "function");
w(class extends sn {
	constructor(e) {
		super(), this.shape = e;
	}
	check(e, t) {
		let n = l(this.shape, (n) => n.check(e, t));
		return !n && t?.extend(null, "Intersectinon", typeof e), n;
	}
}, (e) => e.shape.length > 0);
var Ln = class extends sn {
	static _dilutes = !0;
	constructor(e) {
		super(), this.shape = e;
	}
	check(e, t) {
		let n = u(this.shape, (n) => n.check(e, t));
		return t?.extend(null, "Union", typeof e), n;
	}
}, Rn = (...e) => e.findIndex((e) => zn.check(e)) >= 0 ? Rn(...e.map((e) => nr(e)).map((e) => zn.check(e) ? e.shape : [e]).flat(1)) : e.length === 1 ? e[0] : new Ln(e), zn = w(Ln), Bn = () => !0, Vn = T(Bn), Hn = w(ln, (e) => e.shape === Bn), Un = T((e) => typeof e == "bigint"), Wn = T((e) => e === Un), Gn = T((e) => typeof e == "symbol");
T((e) => e === Gn);
var Kn = T((e) => typeof e == "number"), qn = T((e) => e === Kn), Jn = T((e) => typeof e == "string"), Yn = T((e) => e === Jn), Xn = T((e) => typeof e == "boolean"), Zn = T((e) => e === Xn), Qn = dn(void 0);
w(un, (e) => e.shape.length === 1 && e.shape[0] === void 0), dn(void 0);
var $n = dn(null), er = w(un, (e) => e.shape.length === 1 && e.shape[0] === null);
w(Uint8Array), w(cn, (e) => e.shape === Uint8Array);
var tr = Rn(Kn, Jn, $n, Qn, Un, Xn, Gn);
(() => {
	let e = kn(Vn), t = wn(Jn, Vn), n = Rn(Kn, Jn, $n, Xn, e, t);
	return e.shape = n, t.shape.values = n, n;
})();
var nr = (e) => {
	if (Pn.check(e)) return e;
	if (Sn.check(e)) {
		let t = {};
		for (let n in e) t[n] = nr(e[n]);
		return bn(t);
	}
	if (jn.check(e)) return Rn(...e.map(nr));
	if (tr.check(e)) return dn(e);
	if (In.check(e)) return w(e);
	/* c8 ignore next */
	S();
}, rr = Ht ? () => {} : (e, t) => {
	let n = new an();
	if (!t.check(e, n)) throw Be(`Expected value to be of type ${t.constructor.name}.\n${n.toString()}`);
}, ir = class {
	constructor(e) {
		this.patterns = [], this.$state = e;
	}
	if(e, t) {
		return this.patterns.push({
			if: nr(e),
			h: t
		}), this;
	}
	else(e) {
		return this.if(Vn, e);
	}
	done() {
		return (e, t) => {
			for (let n = 0; n < this.patterns.length; n++) {
				let r = this.patterns[n];
				if (r.if.check(e)) return r.h(e, t);
			}
			throw Be("Unhandled pattern");
		};
	}
}, ar = ((e) => new ir(e))(Vn).if(qn, (e, t) => Zt(t, y, v)).if(Yn, (e, t) => tn(t)).if(Zn, (e, t) => Xt(t)).if(Wn, (e, t) => BigInt(Zt(t, y, v))).if(zn, (e, t) => or(t, nn(t, e.shape))).if(xn, (e, t) => {
	let n = {};
	for (let r in e.shape) {
		let i = e.shape[r];
		if (_n.check(i)) {
			if (Xt(t)) continue;
			i = i.shape;
		}
		n[r] = ar(i, t);
	}
	return n;
}).if(An, (e, t) => {
	let n = [], r = Qt(t, 0, 42);
	for (let i = 0; i < r; i++) n.push(or(t, e.shape));
	return n;
}).if(fn, (e, t) => nn(t, e.shape)).if(er, (e, t) => null).if(Fn, (e, t) => {
	let n = or(t, e.res);
	return () => n;
}).if(Hn, (e, t) => or(t, nn(t, [
	Kn,
	Jn,
	$n,
	Qn,
	Un,
	Xn,
	kn(Kn),
	wn(Rn("a", "b", "c"), Kn)
]))).if(Tn, (e, t) => {
	let n = {}, r = Zt(t, 0, 3);
	for (let i = 0; i < r; i++) {
		let r = or(t, e.shape.keys);
		n[r] = or(t, e.shape.values);
	}
	return n;
}).done(), or = (e, t) => ar(nr(t), e), sr = typeof document < "u" ? document : {};
T((e) => e.nodeType === fr), typeof DOMParser < "u" && new DOMParser(), T((e) => e.nodeType === lr), T((e) => e.nodeType === ur);
var cr = (e) => r(e, (e, t) => `${t}:${e};`).join(""), lr = sr.ELEMENT_NODE, ur = sr.TEXT_NODE;
sr.CDATA_SECTION_NODE, sr.COMMENT_NODE;
var dr = sr.DOCUMENT_NODE;
sr.DOCUMENT_TYPE_NODE;
var fr = sr.DOCUMENT_FRAGMENT_NODE;
T((e) => e.nodeType === dr);
/* c8 ignore stop */
// node_modules/lib0/eventloop.js
var pr = ((e) => class {
	constructor(e) {
		this._ = e;
	}
	destroy() {
		e(this._);
	}
})(clearTimeout), mr = (e, t) => new pr(setTimeout(t, e)), hr = Symbol, gr = hr(), _r = hr(), vr = hr(), yr = hr(), br = hr(), xr = hr(), Sr = hr(), Cr = hr(), wr = hr(), Tr = (e) => {
	e.length === 1 && e[0]?.constructor === Function && (e = e[0]());
	let t = [], n = [], r = 0;
	for (; r < e.length; r++) {
		let n = e[r];
		if (n === void 0) break;
		if (n.constructor === String || n.constructor === Number) t.push(n);
		else if (n.constructor === Object) break;
	}
	for (r > 0 && n.push(t.join("")); r < e.length; r++) {
		let t = e[r];
		t instanceof Symbol || n.push(t);
	}
	return n;
};
pt();
/* c8 ignore stop */
// node_modules/lib0/logging.js
var Er = {
	[gr]: Yt("font-weight", "bold"),
	[_r]: Yt("font-weight", "normal"),
	[vr]: Yt("color", "blue"),
	[br]: Yt("color", "green"),
	[yr]: Yt("color", "grey"),
	[xr]: Yt("color", "red"),
	[Sr]: Yt("color", "purple"),
	[Cr]: Yt("color", "orange"),
	[wr]: Yt("color", "black")
}, Dr = Ut ? (t) => {
	t.length === 1 && t[0]?.constructor === Function && (t = t[0]());
	let n = [], r = [], i = e(), a = [], o = 0;
	for (; o < t.length; o++) {
		let e = t[o], a = Er[e];
		if (a !== void 0) i.set(a.left, a.right);
		else {
			if (e === void 0) break;
			if (e.constructor === String || e.constructor === Number) {
				let t = cr(i);
				o > 0 || t.length > 0 ? (n.push("%c" + e), r.push(t)) : n.push(e);
			} else break;
		}
	}
	for (o > 0 && (a = r, a.unshift(n.join(""))); o < t.length; o++) {
		let e = t[o];
		e instanceof Symbol || a.push(e);
	}
	return a;
} : Tr, Or = (...e) => {
	/* c8 ignore next */
	console.log(...Dr(e)), Ar.forEach((t) => t.print(e));
}, kr = (...e) => {
	console.warn(...Dr(e)), e.unshift(Cr), Ar.forEach((t) => t.print(e));
}, Ar = a(), jr = (e) => ({
	[Symbol.iterator]() {
		return this;
	},
	next: e
}), Mr = (e, t) => jr(() => {
	let n;
	do
		n = e.next();
	while (!n.done && !t(n.value));
	return n;
}), Nr = (e, t) => jr(() => {
	let { done: n, value: r } = e.next();
	return {
		done: n,
		value: n ? void 0 : t(r)
	};
}), Pr = class {
	constructor(e, t) {
		this.clock = e, this.len = t;
	}
}, Fr = class {
	constructor() {
		this.clients = /* @__PURE__ */ new Map();
	}
}, Ir = (e, t, n) => t.clients.forEach((t, r) => {
	let i = e.doc.store.clients.get(r);
	if (i != null) {
		let r = i[i.length - 1], a = r.id.clock + r.length;
		for (let r = 0, o = t[r]; r < t.length && o.clock < a; o = t[++r]) Hi(e, i, o.clock, o.len, n);
	}
}), Lr = (e, t) => {
	let n = 0, r = e.length - 1;
	for (; n <= r;) {
		let i = m((n + r) / 2), a = e[i], o = a.clock;
		if (o <= t) {
			if (t < o + a.len) return i;
			n = i + 1;
		} else r = i - 1;
	}
	return null;
}, Rr = (e, t) => {
	let n = e.clients.get(t.client);
	return n !== void 0 && Lr(n, t.clock) !== null;
}, zr = (e) => {
	e.clients.forEach((e) => {
		e.sort((e, t) => e.clock - t.clock);
		let t, n;
		for (t = 1, n = 1; t < e.length; t++) {
			let r = e[n - 1], i = e[t];
			r.clock + r.len >= i.clock ? e[n - 1] = new Pr(r.clock, _(r.len, i.clock + i.len - r.clock)) : (n < t && (e[n] = i), n++);
		}
		e.length = n;
	});
}, Br = (e) => {
	let t = new Fr();
	for (let n = 0; n < e.length; n++) e[n].clients.forEach((r, i) => {
		if (!t.clients.has(i)) {
			let a = r.slice();
			for (let t = n + 1; t < e.length; t++) s(a, e[t].clients.get(i) || []);
			t.clients.set(i, a);
		}
	});
	return zr(t), t;
}, Vr = (e, t, r, i) => {
	n(e.clients, t, () => []).push(new Pr(r, i));
}, Hr = () => new Fr(), Ur = (e) => {
	let t = Hr();
	return e.clients.forEach((e, n) => {
		let r = [];
		for (let t = 0; t < e.length; t++) {
			let n = e[t];
			if (n.deleted) {
				let i = n.id.clock, a = n.length;
				if (t + 1 < e.length) for (let n = e[t + 1]; t + 1 < e.length && n.deleted; n = e[++t + 1]) a += n.length;
				r.push(new Pr(i, a));
			}
		}
		r.length > 0 && t.clients.set(n, r);
	}), t;
}, Wr = (e, t) => {
	x(e.restEncoder, t.clients.size), c(t.clients.entries()).sort((e, t) => t[0] - e[0]).forEach(([t, n]) => {
		e.resetDsCurVal(), x(e.restEncoder, t);
		let r = n.length;
		x(e.restEncoder, r);
		for (let t = 0; t < r; t++) {
			let r = n[t];
			e.writeDsClock(r.clock), e.writeDsLen(r.len);
		}
	});
}, Gr = (e) => {
	let t = new Fr(), r = C(e.restDecoder);
	for (let i = 0; i < r; i++) {
		e.resetDsCurVal();
		let r = C(e.restDecoder), i = C(e.restDecoder);
		if (i > 0) {
			let a = n(t.clients, r, () => []);
			for (let t = 0; t < i; t++) a.push(new Pr(e.readDsClock(), e.readDsLen()));
		}
	}
	return t;
}, Kr = (e, t, n) => {
	let r = new Fr(), i = C(e.restDecoder);
	for (let a = 0; a < i; a++) {
		e.resetDsCurVal();
		let i = C(e.restDecoder), a = C(e.restDecoder), o = n.clients.get(i) || [], s = D(n, i);
		for (let n = 0; n < a; n++) {
			let n = e.readDsClock(), a = n + e.readDsLen();
			if (n < s) {
				s < a && Vr(r, i, s, a - s);
				let e = Ii(o, n), c = o[e];
				for (!c.deleted && c.id.clock < n && (o.splice(e + 1, 0, $o(t, c, n - c.id.clock)), e++); e < o.length && (c = o[e++], c.id.clock < a);) c.deleted || (a < c.id.clock + c.length && o.splice(e, 0, $o(t, c, a - c.id.clock)), c.delete(t));
			} else Vr(r, i, n, a - n);
		}
	}
	if (r.clients.size > 0) {
		let e = new ni();
		return x(e.restEncoder, 0), Wr(e, r), e.toUint8Array();
	}
	return null;
}, qr = lt, Jr = class e extends p {
	constructor({ guid: e = ft(), collectionid: t = null, gc: n = !0, gcFilter: r = () => !0, meta: i = null, autoLoad: a = !1, shouldLoad: o = !0 } = {}) {
		super(), this.gc = n, this.gcFilter = r, this.clientID = qr(), this.guid = e, this.collectionid = t, this.share = /* @__PURE__ */ new Map(), this.store = new Ni(), this._transaction = null, this._transactionCleanups = [], this.subdocs = /* @__PURE__ */ new Set(), this._item = null, this.shouldLoad = o, this.autoLoad = a, this.meta = i, this.isLoaded = !1, this.isSynced = !1, this.isDestroyed = !1, this.whenLoaded = mt((e) => {
			this.on("load", () => {
				this.isLoaded = !0, e(this);
			});
		});
		let s = () => mt((e) => {
			let t = (n) => {
				(n === void 0 || n === !0) && (this.off("sync", t), e());
			};
			this.on("sync", t);
		});
		this.on("sync", (e) => {
			e === !1 && this.isSynced && (this.whenSynced = s()), this.isSynced = e === void 0 || e === !0, this.isSynced && !this.isLoaded && this.emit("load", [this]);
		}), this.whenSynced = s();
	}
	load() {
		let e = this._item;
		e !== null && !this.shouldLoad && O(e.parent.doc, (e) => {
			e.subdocsLoaded.add(this);
		}, null, !0), this.shouldLoad = !0;
	}
	getSubdocs() {
		return this.subdocs;
	}
	getSubdocGuids() {
		return new Set(c(this.subdocs).map((e) => e.guid));
	}
	transact(e, t = null) {
		return O(this, e, t);
	}
	get(e, t = k) {
		let r = n(this.share, e, () => {
			let e = new t();
			return e._integrate(this, null), e;
		}), i = r.constructor;
		if (t !== k && i !== t) {
			if (i === k) {
				let n = new t();
				n._map = r._map, r._map.forEach((e) => {
					for (; e !== null; e = e.left) e.parent = n;
				}), n._start = r._start;
				for (let e = n._start; e !== null; e = e.right) e.parent = n;
				return n._length = r._length, this.share.set(e, n), n._integrate(this, null), n;
			}
			throw Error(`Type with the name ${e} has already been defined with a different constructor`);
		}
		return r;
	}
	getArray(e = "") {
		return this.get(e, Va);
	}
	getText(e = "") {
		return this.get(e, co);
	}
	getMap(e = "") {
		return this.get(e, Wa);
	}
	getXmlElement(e = "") {
		return this.get(e, A);
	}
	getXmlFragment(e = "") {
		return this.get(e, fo);
	}
	toJSON() {
		let e = {};
		return this.share.forEach((t, n) => {
			e[n] = t.toJSON();
		}), e;
	}
	destroy() {
		this.isDestroyed = !0, c(this.subdocs).forEach((e) => e.destroy());
		let t = this._item;
		if (t !== null) {
			this._item = null;
			let n = t.content;
			n.doc = new e({
				guid: this.guid,
				...n.opts,
				shouldLoad: !1
			}), n.doc._item = t, O(t.parent.doc, (e) => {
				let r = n.doc;
				t.deleted || e.subdocsAdded.add(r), e.subdocsRemoved.add(this);
			}, null, !0);
		}
		this.emit("destroyed", [!0]), this.emit("destroy", [this]), super.destroy();
	}
}, Yr = class {
	constructor(e) {
		this.restDecoder = e;
	}
	resetDsCurVal() {}
	readDsClock() {
		return C(this.restDecoder);
	}
	readDsLen() {
		return C(this.restDecoder);
	}
}, Xr = class extends Yr {
	readLeftID() {
		return E(C(this.restDecoder), C(this.restDecoder));
	}
	readRightID() {
		return E(C(this.restDecoder), C(this.restDecoder));
	}
	readClient() {
		return C(this.restDecoder);
	}
	readInfo() {
		return Ze(this.restDecoder);
	}
	readString() {
		return $e(this.restDecoder);
	}
	readParentInfo() {
		return C(this.restDecoder) === 1;
	}
	readTypeRef() {
		return C(this.restDecoder);
	}
	readLen() {
		return C(this.restDecoder);
	}
	readAny() {
		return nt(this.restDecoder);
	}
	readBuf() {
		return Kt(Xe(this.restDecoder));
	}
	readJSON() {
		return JSON.parse($e(this.restDecoder));
	}
	readKey() {
		return $e(this.restDecoder);
	}
}, Zr = class {
	constructor(e) {
		this.dsCurrVal = 0, this.restDecoder = e;
	}
	resetDsCurVal() {
		this.dsCurrVal = 0;
	}
	readDsClock() {
		return this.dsCurrVal += C(this.restDecoder), this.dsCurrVal;
	}
	readDsLen() {
		let e = C(this.restDecoder) + 1;
		return this.dsCurrVal += e, e;
	}
}, Qr = class extends Zr {
	constructor(e) {
		super(e), this.keys = [], C(e), this.keyClockDecoder = new at(Xe(e)), this.clientDecoder = new it(Xe(e)), this.leftClockDecoder = new at(Xe(e)), this.rightClockDecoder = new at(Xe(e)), this.infoDecoder = new rt(Xe(e), Ze), this.stringDecoder = new ot(Xe(e)), this.parentInfoDecoder = new rt(Xe(e), Ze), this.typeRefDecoder = new it(Xe(e)), this.lenDecoder = new it(Xe(e));
	}
	readLeftID() {
		return new gi(this.clientDecoder.read(), this.leftClockDecoder.read());
	}
	readRightID() {
		return new gi(this.clientDecoder.read(), this.rightClockDecoder.read());
	}
	readClient() {
		return this.clientDecoder.read();
	}
	readInfo() {
		return this.infoDecoder.read();
	}
	readString() {
		return this.stringDecoder.read();
	}
	readParentInfo() {
		return this.parentInfoDecoder.read() === 1;
	}
	readTypeRef() {
		return this.typeRefDecoder.read();
	}
	readLen() {
		return this.lenDecoder.read();
	}
	readAny() {
		return nt(this.restDecoder);
	}
	readBuf() {
		return Xe(this.restDecoder);
	}
	readJSON() {
		return nt(this.restDecoder);
	}
	readKey() {
		let e = this.keyClockDecoder.read();
		if (e < this.keys.length) return this.keys[e];
		{
			let e = this.stringDecoder.read();
			return this.keys.push(e), e;
		}
	}
}, $r = class {
	constructor() {
		this.restEncoder = he();
	}
	toUint8Array() {
		return ve(this.restEncoder);
	}
	resetDsCurVal() {}
	writeDsClock(e) {
		x(this.restEncoder, e);
	}
	writeDsLen(e) {
		x(this.restEncoder, e);
	}
}, ei = class extends $r {
	writeLeftID(e) {
		x(this.restEncoder, e.client), x(this.restEncoder, e.clock);
	}
	writeRightID(e) {
		x(this.restEncoder, e.client), x(this.restEncoder, e.clock);
	}
	writeClient(e) {
		x(this.restEncoder, e);
	}
	writeInfo(e) {
		be(this.restEncoder, e);
	}
	writeString(e) {
		we(this.restEncoder, e);
	}
	writeParentInfo(e) {
		x(this.restEncoder, +!!e);
	}
	writeTypeRef(e) {
		x(this.restEncoder, e);
	}
	writeLen(e) {
		x(this.restEncoder, e);
	}
	writeAny(e) {
		Ne(this.restEncoder, e);
	}
	writeBuf(e) {
		Ee(this.restEncoder, e);
	}
	writeJSON(e) {
		we(this.restEncoder, JSON.stringify(e));
	}
	writeKey(e) {
		we(this.restEncoder, e);
	}
}, ti = class {
	constructor() {
		this.restEncoder = he(), this.dsCurrVal = 0;
	}
	toUint8Array() {
		return ve(this.restEncoder);
	}
	resetDsCurVal() {
		this.dsCurrVal = 0;
	}
	writeDsClock(e) {
		let t = e - this.dsCurrVal;
		this.dsCurrVal = e, x(this.restEncoder, t);
	}
	writeDsLen(e) {
		e === 0 && S(), x(this.restEncoder, e - 1), this.dsCurrVal += e;
	}
}, ni = class extends ti {
	constructor() {
		super(), this.keyMap = /* @__PURE__ */ new Map(), this.keyClock = 0, this.keyClockEncoder = new Re(), this.clientEncoder = new Ie(), this.leftClockEncoder = new Re(), this.rightClockEncoder = new Re(), this.infoEncoder = new Pe(be), this.stringEncoder = new ze(), this.parentInfoEncoder = new Pe(be), this.typeRefEncoder = new Ie(), this.lenEncoder = new Ie();
	}
	toUint8Array() {
		let e = he();
		return x(e, 0), Ee(e, this.keyClockEncoder.toUint8Array()), Ee(e, this.clientEncoder.toUint8Array()), Ee(e, this.leftClockEncoder.toUint8Array()), Ee(e, this.rightClockEncoder.toUint8Array()), Ee(e, ve(this.infoEncoder)), Ee(e, this.stringEncoder.toUint8Array()), Ee(e, ve(this.parentInfoEncoder)), Ee(e, this.typeRefEncoder.toUint8Array()), Ee(e, this.lenEncoder.toUint8Array()), Te(e, ve(this.restEncoder)), ve(e);
	}
	writeLeftID(e) {
		this.clientEncoder.write(e.client), this.leftClockEncoder.write(e.clock);
	}
	writeRightID(e) {
		this.clientEncoder.write(e.client), this.rightClockEncoder.write(e.clock);
	}
	writeClient(e) {
		this.clientEncoder.write(e);
	}
	writeInfo(e) {
		this.infoEncoder.write(e);
	}
	writeString(e) {
		this.stringEncoder.write(e);
	}
	writeParentInfo(e) {
		this.parentInfoEncoder.write(+!!e);
	}
	writeTypeRef(e) {
		this.typeRefEncoder.write(e);
	}
	writeLen(e) {
		this.lenEncoder.write(e);
	}
	writeAny(e) {
		Ne(this.restEncoder, e);
	}
	writeBuf(e) {
		Ee(this.restEncoder, e);
	}
	writeJSON(e) {
		Ne(this.restEncoder, e);
	}
	writeKey(e) {
		let t = this.keyMap.get(e);
		t === void 0 ? (this.keyClockEncoder.write(this.keyClock++), this.stringEncoder.write(e)) : this.keyClockEncoder.write(t);
	}
}, ri = (e, t, n, r) => {
	r = _(r, t[0].id.clock);
	let i = Ii(t, r);
	x(e.restEncoder, t.length - i), e.writeClient(n), x(e.restEncoder, r);
	let a = t[i];
	a.write(e, r - a.id.clock);
	for (let n = i + 1; n < t.length; n++) t[n].write(e, 0);
}, ii = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	n.forEach((e, n) => {
		D(t, n) > e && r.set(n, e);
	}), Pi(t).forEach((e, t) => {
		n.has(t) || r.set(t, 0);
	}), x(e.restEncoder, r.size), c(r.entries()).sort((e, t) => t[0] - e[0]).forEach(([n, r]) => {
		ri(e, t.clients.get(n), n, r);
	});
}, ai = (t, n) => {
	let r = e(), i = C(t.restDecoder);
	for (let e = 0; e < i; e++) {
		let e = C(t.restDecoder), i = Array(e), a = t.readClient(), o = C(t.restDecoder);
		r.set(a, {
			i: 0,
			refs: i
		});
		for (let r = 0; r < e; r++) {
			let e = t.readInfo();
			switch (31 & e) {
				case 0: {
					let e = t.readLen();
					i[r] = new So(E(a, o), e), o += e;
					break;
				}
				case 10: {
					let e = C(t.restDecoder);
					i[r] = new as(E(a, o), e), o += e;
					break;
				}
				default: {
					let s = !(e & 192), c = new j(E(a, o), null, (e & 128) == 128 ? t.readLeftID() : null, null, (e & 64) == 64 ? t.readRightID() : null, s ? t.readParentInfo() ? n.get(t.readString()) : t.readLeftID() : null, s && (e & 32) == 32 ? t.readString() : null, ns(t, e));
					i[r] = c, o += c.length;
				}
			}
		}
	}
	return r;
}, oi = (e, t, r) => {
	let i = [], a = c(r.keys()).sort((e, t) => e - t);
	if (a.length === 0) return null;
	let o = () => {
		if (a.length === 0) return null;
		let e = r.get(a[a.length - 1]);
		for (; e.refs.length === e.i;) if (a.pop(), a.length > 0) e = r.get(a[a.length - 1]);
		else return null;
		return e;
	}, s = o();
	if (s === null) return null;
	let l = new Ni(), u = /* @__PURE__ */ new Map(), d = (e, t) => {
		let n = u.get(e);
		(n == null || n > t) && u.set(e, t);
	}, f = s.refs[s.i++], p = /* @__PURE__ */ new Map(), m = () => {
		for (let e of i) {
			let t = e.id.client, n = r.get(t);
			n ? (n.i--, l.clients.set(t, n.refs.slice(n.i)), r.delete(t), n.i = 0, n.refs = []) : l.clients.set(t, [e]), a = a.filter((e) => e !== t);
		}
		i.length = 0;
	};
	for (;;) {
		if (f.constructor !== as) {
			let a = n(p, f.id.client, () => D(t, f.id.client)) - f.id.clock;
			if (a < 0) i.push(f), d(f.id.client, f.id.clock - 1), m();
			else {
				let n = f.getMissing(e, t);
				if (n !== null) {
					i.push(f);
					let e = r.get(n) || {
						refs: [],
						i: 0
					};
					if (e.refs.length === e.i) d(n, D(t, n)), m();
					else {
						f = e.refs[e.i++];
						continue;
					}
				} else (a === 0 || a < f.length) && (f.integrate(e, a), p.set(f.id.client, f.id.clock + f.length));
			}
		}
		if (i.length > 0) f = i.pop();
		else if (s !== null && s.i < s.refs.length) f = s.refs[s.i++];
		else {
			if (s = o(), s === null) break;
			f = s.refs[s.i++];
		}
	}
	if (l.clients.size > 0) {
		let e = new ni();
		return ii(e, l, /* @__PURE__ */ new Map()), x(e.restEncoder, 0), {
			missing: u,
			update: e.toUint8Array()
		};
	}
	return null;
}, si = (e, t) => ii(e, t.doc.store, t.beforeState), ci = (e, t, n, r = new Qr(e)) => O(t, (e) => {
	e.local = !1;
	let t = !1, n = e.doc, i = n.store, a = oi(e, i, ai(r, n)), o = i.pendingStructs;
	if (o) {
		for (let [e, n] of o.missing) if (n < D(i, e)) {
			t = !0;
			break;
		}
		if (a) {
			for (let [e, t] of a.missing) {
				let n = o.missing.get(e);
				(n == null || n > t) && o.missing.set(e, t);
			}
			o.update = ia([o.update, a.update]);
		}
	} else i.pendingStructs = a;
	let s = Kr(r, e, i);
	if (i.pendingDs) {
		let t = new Qr(qe(i.pendingDs));
		C(t.restDecoder);
		let n = Kr(t, e, i);
		i.pendingDs = s && n ? ia([s, n]) : s || n;
	} else i.pendingDs = s;
	if (t) {
		let t = i.pendingStructs.update;
		i.pendingStructs = null, li(e.doc, t);
	}
}, n, !1), li = (e, t, n, r = Qr) => {
	let i = qe(t);
	ci(i, e, n, new r(i));
}, ui = (e, t, n) => li(e, t, n, Xr), di = class {
	constructor() {
		this.l = [];
	}
}, fi = () => new di(), pi = (e, t) => e.l.push(t), mi = (e, t) => {
	let n = e.l, r = n.length;
	e.l = n.filter((e) => t !== e), r === e.l.length && console.error("[yjs] Tried to remove event handler that doesn't exist.");
}, hi = (e, t, n) => jt(e.l, [t, n]), gi = class {
	constructor(e, t) {
		this.client = e, this.clock = t;
	}
}, _i = (e, t) => e === t || e !== null && t !== null && e.client === t.client && e.clock === t.clock, E = (e, t) => new gi(e, t), vi = (e) => {
	for (let [t, n] of e.doc.share.entries()) if (n === e) return t;
	throw S();
}, yi = (e, t) => {
	for (; t !== null;) {
		if (t.parent === e) return !0;
		t = t.parent._item;
	}
	return !1;
}, bi = class {
	constructor(e, t, n, r = 0) {
		this.type = e, this.tname = t, this.item = n, this.assoc = r;
	}
}, xi = class {
	constructor(e, t, n = 0) {
		this.type = e, this.index = t, this.assoc = n;
	}
}, Si = (e, t, n = 0) => new xi(e, t, n), Ci = (e, t, n) => {
	let r = null, i = null;
	return e._item === null ? i = vi(e) : r = E(e._item.id.client, e._item.id.clock), new bi(r, i, t, n);
}, wi = (e, t, n = 0) => {
	let r = e._start;
	if (n < 0) {
		if (t === 0) return Ci(e, null, n);
		t--;
	}
	for (; r !== null;) {
		if (!r.deleted && r.countable) {
			if (r.length > t) return Ci(e, E(r.id.client, r.id.clock + t), n);
			t -= r.length;
		}
		if (r.right === null && n < 0) return Ci(e, r.lastId, n);
		r = r.right;
	}
	return Ci(e, null, n);
}, Ti = (e, t) => {
	let n = Li(e, t);
	return {
		item: n,
		diff: t.clock - n.id.clock
	};
}, Ei = (e, t, n = !0) => {
	let r = t.store, i = e.item, a = e.type, o = e.tname, s = e.assoc, c = null, l = 0;
	if (i !== null) {
		if (D(r, i.client) <= i.clock) return null;
		let e = n ? Zo(r, i) : Ti(r, i), t = e.item;
		if (!(t instanceof j)) return null;
		if (c = t.parent, c._item === null || !c._item.deleted) {
			l = t.deleted || !t.countable ? 0 : e.diff + (s >= 0 ? 0 : 1);
			let n = t.left;
			for (; n !== null;) !n.deleted && n.countable && (l += n.length), n = n.left;
		}
	} else {
		if (o !== null) c = t.get(o);
		else if (a !== null) {
			if (D(r, a.client) <= a.clock) return null;
			let { item: e } = n ? Zo(r, a) : { item: Li(r, a) };
			if (e instanceof j && e.content instanceof Yo) c = e.content.type;
			else return null;
		} else throw S();
		l = s >= 0 ? c._length : 0;
	}
	return Si(c, l, e.assoc);
}, Di = class {
	constructor(e, t) {
		this.ds = e, this.sv = t;
	}
}, Oi = (e, t) => new Di(e, t), ki = Oi(Hr(), /* @__PURE__ */ new Map()), Ai = (e) => Oi(Ur(e.store), Pi(e.store)), ji = (e, t) => t === void 0 ? !e.deleted : t.sv.has(e.id.client) && (t.sv.get(e.id.client) || 0) > e.id.clock && !Rr(t.ds, e.id), Mi = (e, t) => {
	let r = n(e.meta, Mi, a), i = e.doc.store;
	r.has(t) || (t.sv.forEach((t, n) => {
		t < D(i, n) && zi(e, E(n, t));
	}), Ir(e, t.ds, (e) => {}), r.add(t));
}, Ni = class {
	constructor() {
		this.clients = /* @__PURE__ */ new Map(), this.pendingStructs = null, this.pendingDs = null;
	}
}, Pi = (e) => {
	let t = /* @__PURE__ */ new Map();
	return e.clients.forEach((e, n) => {
		let r = e[e.length - 1];
		t.set(n, r.id.clock + r.length);
	}), t;
}, D = (e, t) => {
	let n = e.clients.get(t);
	if (n === void 0) return 0;
	let r = n[n.length - 1];
	return r.id.clock + r.length;
}, Fi = (e, t) => {
	let n = e.clients.get(t.id.client);
	if (n === void 0) n = [], e.clients.set(t.id.client, n);
	else {
		let e = n[n.length - 1];
		if (e.id.clock + e.length !== t.id.clock) throw S();
	}
	n.push(t);
}, Ii = (e, t) => {
	let n = 0, r = e.length - 1, i = e[r], a = i.id.clock;
	if (a === t) return r;
	let o = m(t / (a + i.length - 1) * r);
	for (; n <= r;) {
		if (i = e[o], a = i.id.clock, a <= t) {
			if (t < a + i.length) return o;
			n = o + 1;
		} else r = o - 1;
		o = m((n + r) / 2);
	}
	throw S();
}, Li = (e, t) => {
	let n = e.clients.get(t.client);
	return n[Ii(n, t.clock)];
}, Ri = (e, t, n) => {
	let r = Ii(t, n), i = t[r];
	return i.id.clock < n && i instanceof j ? (t.splice(r + 1, 0, $o(e, i, n - i.id.clock)), r + 1) : r;
}, zi = (e, t) => {
	let n = e.doc.store.clients.get(t.client);
	return n[Ri(e, n, t.clock)];
}, Bi = (e, t, n) => {
	let r = t.clients.get(n.client), i = Ii(r, n.clock), a = r[i];
	return n.clock !== a.id.clock + a.length - 1 && a.constructor !== So && r.splice(i + 1, 0, $o(e, a, n.clock - a.id.clock + 1)), a;
}, Vi = (e, t, n) => {
	let r = e.clients.get(t.id.client);
	r[Ii(r, t.id.clock)] = n;
}, Hi = (e, t, n, r, i) => {
	if (r === 0) return;
	let a = n + r, o = Ri(e, t, n), s;
	do
		s = t[o++], a < s.id.clock + s.length && Ri(e, t, a), i(s);
	while (o < t.length && t[o].id.clock < a);
}, Ui = class {
	constructor(e, t, n) {
		this.doc = e, this.deleteSet = new Fr(), this.beforeState = Pi(e.store), this.afterState = /* @__PURE__ */ new Map(), this.changed = /* @__PURE__ */ new Map(), this.changedParentTypes = /* @__PURE__ */ new Map(), this._mergeStructs = [], this.origin = t, this.meta = /* @__PURE__ */ new Map(), this.local = n, this.subdocsAdded = /* @__PURE__ */ new Set(), this.subdocsRemoved = /* @__PURE__ */ new Set(), this.subdocsLoaded = /* @__PURE__ */ new Set(), this._needFormattingCleanup = !1;
	}
}, Wi = (e, t) => t.deleteSet.clients.size === 0 && !i(t.afterState, (e, n) => t.beforeState.get(n) !== e) ? !1 : (zr(t.deleteSet), si(e, t), Wr(e, t.deleteSet), !0), Gi = (e, t, r) => {
	let i = t._item;
	(i === null || i.id.clock < (e.beforeState.get(i.id.client) || 0) && !i.deleted) && n(e.changed, t, a).add(r);
}, Ki = (e, t) => {
	let n = e[t], r = e[t - 1], i = t;
	for (; i > 0 && r.deleted === n.deleted && r.constructor === n.constructor && r.mergeWith(n); n = r, r = e[--i - 1]) n instanceof j && n.parentSub !== null && n.parent._map.get(n.parentSub) === n && n.parent._map.set(n.parentSub, r);
	let a = t - i;
	return a && e.splice(t + 1 - a, a), a;
}, qi = (e, t, n) => {
	for (let [r, i] of e.clients.entries()) {
		let e = t.clients.get(r);
		for (let r = i.length - 1; r >= 0; r--) {
			let a = i[r], o = a.clock + a.len;
			for (let r = Ii(e, a.clock), i = e[r]; r < e.length && i.id.clock < o; i = e[++r]) {
				let i = e[r];
				if (a.clock + a.len <= i.id.clock) break;
				i instanceof j && i.deleted && !i.keep && n(i) && i.gc(t, !1);
			}
		}
	}
}, Ji = (e, t) => {
	e.clients.forEach((e, n) => {
		let r = t.clients.get(n);
		for (let t = e.length - 1; t >= 0; t--) {
			let n = e[t], i = g(r.length - 1, 1 + Ii(r, n.clock + n.len - 1));
			for (let e = i, t = r[e]; e > 0 && t.id.clock >= n.clock; t = r[e]) e -= 1 + Ki(r, e);
		}
	});
}, Yi = (e, t) => {
	if (t < e.length) {
		let n = e[t], r = n.doc, i = r.store, a = n.deleteSet, o = n._mergeStructs;
		try {
			zr(a), n.afterState = Pi(n.doc.store), r.emit("beforeObserverCalls", [n, r]);
			let e = [];
			n.changed.forEach((t, r) => e.push(() => {
				r._item !== null && r._item.deleted || r._callObserver(n, t);
			})), e.push(() => {
				n.changedParentTypes.forEach((t, r) => {
					r._dEH.l.length > 0 && (r._item === null || !r._item.deleted) && e.push(() => {
						t = t.filter((e) => e.target._item === null || !e.target._item.deleted), t.forEach((e) => {
							e.currentTarget = r, e._path = null;
						}), t.sort((e, t) => e.path.length - t.path.length), hi(r._dEH, t, n);
					});
				}), e.push(() => r.emit("afterTransaction", [n, r])), e.push(() => {
					n._needFormattingCleanup && ao(n);
				});
			}), jt(e, []);
		} finally {
			r.gc && qi(a, i, r.gcFilter), Ji(a, i), n.afterState.forEach((e, t) => {
				let r = n.beforeState.get(t) || 0;
				if (r !== e) {
					let e = i.clients.get(t), n = _(Ii(e, r), 1);
					for (let t = e.length - 1; t >= n;) t -= 1 + Ki(e, t);
				}
			});
			for (let e = o.length - 1; e >= 0; e--) {
				let { client: t, clock: n } = o[e].id, r = i.clients.get(t), a = Ii(r, n);
				a + 1 < r.length && Ki(r, a + 1) > 1 || a > 0 && Ki(r, a);
			}
			if (!n.local && n.afterState.get(r.clientID) !== n.beforeState.get(r.clientID) && (Or(Cr, gr, "[yjs] ", _r, xr, "Changed the client-id because another client seems to be using it."), r.clientID = qr()), r.emit("afterTransactionCleanup", [n, r]), r._observers.has("update")) {
				let e = new ei();
				Wi(e, n) && r.emit("update", [
					e.toUint8Array(),
					n.origin,
					r,
					n
				]);
			}
			if (r._observers.has("updateV2")) {
				let e = new ni();
				Wi(e, n) && r.emit("updateV2", [
					e.toUint8Array(),
					n.origin,
					r,
					n
				]);
			}
			let { subdocsAdded: s, subdocsLoaded: c, subdocsRemoved: l } = n;
			(s.size > 0 || l.size > 0 || c.size > 0) && (s.forEach((e) => {
				e.clientID = r.clientID, e.collectionid ??= r.collectionid, r.subdocs.add(e);
			}), l.forEach((e) => r.subdocs.delete(e)), r.emit("subdocs", [
				{
					loaded: c,
					added: s,
					removed: l
				},
				r,
				n
			]), l.forEach((e) => e.destroy())), e.length <= t + 1 ? (r._transactionCleanups = [], r.emit("afterAllTransactions", [r, e])) : Yi(e, t + 1);
		}
	}
}, O = (e, t, n = null, r = !0) => {
	let i = e._transactionCleanups, a = !1, o = null;
	e._transaction === null && (a = !0, e._transaction = new Ui(e, n, r), i.push(e._transaction), i.length === 1 && e.emit("beforeAllTransactions", [e]), e.emit("beforeTransaction", [e._transaction, e]));
	try {
		o = t(e._transaction);
	} finally {
		if (a) {
			let t = e._transaction === i[0];
			e._transaction = null, t && Yi(i, 0);
		}
	}
	return o;
}, Xi = class {
	constructor(e, t) {
		this.insertions = t, this.deletions = e, this.meta = /* @__PURE__ */ new Map();
	}
}, Zi = (e, t, n) => {
	Ir(e, n.deletions, (n) => {
		n instanceof j && t.scope.some((t) => t === e.doc || yi(t, n)) && Qo(n, !1);
	});
}, Qi = (e, t, n) => {
	let r = null, i = e.doc, a = e.scope;
	O(i, (n) => {
		for (; t.length > 0 && e.currStackItem === null;) {
			let r = i.store, o = t.pop(), s = /* @__PURE__ */ new Set(), c = [], l = !1;
			Ir(n, o.insertions, (e) => {
				if (e instanceof j) {
					if (e.redone !== null) {
						let { item: t, diff: i } = Zo(r, e.id);
						i > 0 && (t = zi(n, E(t.id.client, t.id.clock + i))), e = t;
					}
					!e.deleted && a.some((t) => t === n.doc || yi(t, e)) && c.push(e);
				}
			}), Ir(n, o.deletions, (e) => {
				e instanceof j && a.some((t) => t === n.doc || yi(t, e)) && !Rr(o.insertions, e.id) && s.add(e);
			}), s.forEach((t) => {
				l = ts(n, t, s, o.insertions, e.ignoreRemoteMapChanges, e) !== null || l;
			});
			for (let t = c.length - 1; t >= 0; t--) {
				let r = c[t];
				e.deleteFilter(r) && (r.delete(n), l = !0);
			}
			e.currStackItem = l ? o : null;
		}
		n.changed.forEach((e, t) => {
			e.has(null) && t._searchMarker && (t._searchMarker.length = 0);
		}), r = n;
	}, e);
	let o = e.currStackItem;
	if (o != null) {
		let t = r.changedParentTypes;
		e.emit("stack-item-popped", [{
			stackItem: o,
			type: n,
			changedParentTypes: t,
			origin: e
		}, e]), e.currStackItem = null;
	}
	return o;
}, $i = class extends p {
	constructor(e, { captureTimeout: t = 500, captureTransaction: n = (e) => !0, deleteFilter: r = () => !0, trackedOrigins: i = /* @__PURE__ */ new Set([null]), ignoreRemoteMapChanges: a = !1, doc: o = f(e) ? e[0].doc : e instanceof Jr ? e : e.doc } = {}) {
		super(), this.scope = [], this.doc = o, this.addToScope(e), this.deleteFilter = r, i.add(this), this.trackedOrigins = i, this.captureTransaction = n, this.undoStack = [], this.redoStack = [], this.undoing = !1, this.redoing = !1, this.currStackItem = null, this.lastChange = 0, this.ignoreRemoteMapChanges = a, this.captureTimeout = t, this.afterTransactionHandler = (e) => {
			if (!this.captureTransaction(e) || !this.scope.some((t) => e.changedParentTypes.has(t) || t === this.doc) || !this.trackedOrigins.has(e.origin) && (!e.origin || !this.trackedOrigins.has(e.origin.constructor))) return;
			let t = this.undoing, n = this.redoing, r = t ? this.redoStack : this.undoStack;
			t ? this.stopCapturing() : n || this.clear(!1, !0);
			let i = new Fr();
			e.afterState.forEach((t, n) => {
				let r = e.beforeState.get(n) || 0, a = t - r;
				a > 0 && Vr(i, n, r, a);
			});
			let a = pt(), o = !1;
			if (this.lastChange > 0 && a - this.lastChange < this.captureTimeout && r.length > 0 && !t && !n) {
				let t = r[r.length - 1];
				t.deletions = Br([t.deletions, e.deleteSet]), t.insertions = Br([t.insertions, i]);
			} else r.push(new Xi(e.deleteSet, i)), o = !0;
			!t && !n && (this.lastChange = a), Ir(e, e.deleteSet, (t) => {
				t instanceof j && this.scope.some((n) => n === e.doc || yi(n, t)) && Qo(t, !0);
			});
			let s = [{
				stackItem: r[r.length - 1],
				origin: e.origin,
				type: t ? "redo" : "undo",
				changedParentTypes: e.changedParentTypes
			}, this];
			o ? this.emit("stack-item-added", s) : this.emit("stack-item-updated", s);
		}, this.destroy = this.destroy.bind(this), this.doc.on("afterTransaction", this.afterTransactionHandler), this.doc.on("destroy", this.destroy);
	}
	addToScope(e) {
		let t = new Set(this.scope);
		e = f(e) ? e : [e], e.forEach((e) => {
			t.has(e) || (t.add(e), (e instanceof k ? e.doc !== this.doc : e !== this.doc) && kr("[yjs#509] Not same Y.Doc"), this.scope.push(e));
		});
	}
	addTrackedOrigin(e) {
		this.trackedOrigins.add(e);
	}
	removeTrackedOrigin(e) {
		this.trackedOrigins.delete(e);
	}
	clear(e = !0, t = !0) {
		(e && this.canUndo() || t && this.canRedo()) && this.doc.transact((n) => {
			e && (this.undoStack.forEach((e) => Zi(n, this, e)), this.undoStack = []), t && (this.redoStack.forEach((e) => Zi(n, this, e)), this.redoStack = []), this.emit("stack-cleared", [{
				undoStackCleared: e,
				redoStackCleared: t
			}]);
		});
	}
	stopCapturing() {
		this.lastChange = 0;
	}
	undo() {
		this.undoing = !0;
		let e;
		try {
			e = Qi(this, this.undoStack, "undo");
		} finally {
			this.undoing = !1;
		}
		return e;
	}
	redo() {
		this.redoing = !0;
		let e;
		try {
			e = Qi(this, this.redoStack, "redo");
		} finally {
			this.redoing = !1;
		}
		return e;
	}
	canUndo() {
		return this.undoStack.length > 0;
	}
	canRedo() {
		return this.redoStack.length > 0;
	}
	destroy() {
		this.trackedOrigins.delete(this), this.doc.off("afterTransaction", this.afterTransactionHandler), this.doc.off("destroy", this.destroy), super.destroy();
	}
};
function* ea(e) {
	let t = C(e.restDecoder);
	for (let n = 0; n < t; n++) {
		let t = C(e.restDecoder), n = e.readClient(), r = C(e.restDecoder);
		for (let i = 0; i < t; i++) {
			let t = e.readInfo();
			if (t === 10) {
				let t = C(e.restDecoder);
				yield new as(E(n, r), t), r += t;
			} else if (31 & t) {
				let i = !(t & 192), a = new j(E(n, r), null, (t & 128) == 128 ? e.readLeftID() : null, null, (t & 64) == 64 ? e.readRightID() : null, i ? e.readParentInfo() ? e.readString() : e.readLeftID() : null, i && (t & 32) == 32 ? e.readString() : null, ns(e, t));
				yield a, r += a.length;
			} else {
				let t = e.readLen();
				yield new So(E(n, r), t), r += t;
			}
		}
	}
}
var ta = class {
	constructor(e, t) {
		this.gen = ea(e), this.curr = null, this.done = !1, this.filterSkips = t, this.next();
	}
	next() {
		do
			this.curr = this.gen.next().value || null;
		while (this.filterSkips && this.curr !== null && this.curr.constructor === as);
		return this.curr;
	}
}, na = class {
	constructor(e) {
		this.currClient = 0, this.startClock = 0, this.written = 0, this.encoder = e, this.clientStructs = [];
	}
}, ra = (e, t) => {
	if (e.constructor === So) {
		let { client: n, clock: r } = e.id;
		return new So(E(n, r + t), e.length - t);
	}
	if (e.constructor === as) {
		let { client: n, clock: r } = e.id;
		return new as(E(n, r + t), e.length - t);
	}
	{
		let n = e, { client: r, clock: i } = n.id;
		return new j(E(r, i + t), null, E(r, i + t - 1), null, n.rightOrigin, n.parent, n.parentSub, n.content.splice(t));
	}
}, ia = (e, t = Qr, n = ni) => {
	if (e.length === 1) return e[0];
	let r = e.map((e) => new t(qe(e))), i = r.map((e) => new ta(e, !0)), a = null, o = new n(), s = new na(o);
	for (; i = i.filter((e) => e.curr !== null), i.sort((e, t) => {
		if (e.curr.id.client === t.curr.id.client) {
			let n = e.curr.id.clock - t.curr.id.clock;
			return n === 0 ? e.curr.constructor === t.curr.constructor ? 0 : e.curr.constructor === as ? 1 : -1 : n;
		}
		return t.curr.id.client - e.curr.id.client;
	}), i.length !== 0;) {
		let e = i[0], t = e.curr.id.client;
		if (a !== null) {
			let n = e.curr, r = !1;
			for (; n !== null && n.id.clock + n.length <= a.struct.id.clock + a.struct.length && n.id.client >= a.struct.id.client;) n = e.next(), r = !0;
			if (n === null || n.id.client !== t || r && n.id.clock > a.struct.id.clock + a.struct.length) continue;
			if (t !== a.struct.id.client) oa(s, a.struct, a.offset), a = {
				struct: n,
				offset: 0
			}, e.next();
			else if (a.struct.id.clock + a.struct.length < n.id.clock) {
				if (a.struct.constructor === as) a.struct.length = n.id.clock + n.length - a.struct.id.clock;
				else {
					oa(s, a.struct, a.offset);
					let e = n.id.clock - a.struct.id.clock - a.struct.length;
					a = {
						struct: new as(E(t, a.struct.id.clock + a.struct.length), e),
						offset: 0
					};
				}
			} else {
				let t = a.struct.id.clock + a.struct.length - n.id.clock;
				t > 0 && (a.struct.constructor === as ? a.struct.length -= t : n = ra(n, t)), a.struct.mergeWith(n) || (oa(s, a.struct, a.offset), a = {
					struct: n,
					offset: 0
				}, e.next());
			}
		} else a = {
			struct: e.curr,
			offset: 0
		}, e.next();
		for (let n = e.curr; n !== null && n.id.client === t && n.id.clock === a.struct.id.clock + a.struct.length && n.constructor !== as; n = e.next()) oa(s, a.struct, a.offset), a = {
			struct: n,
			offset: 0
		};
	}
	return a !== null && (oa(s, a.struct, a.offset), a = null), sa(s), Wr(o, Br(r.map((e) => Gr(e)))), o.toUint8Array();
}, aa = (e) => {
	e.written > 0 && (e.clientStructs.push({
		written: e.written,
		restEncoder: ve(e.encoder.restEncoder)
	}), e.encoder.restEncoder = he(), e.written = 0);
}, oa = (e, t, n) => {
	e.written > 0 && e.currClient !== t.id.client && aa(e), e.written === 0 && (e.currClient = t.id.client, e.encoder.writeClient(t.id.client), x(e.encoder.restEncoder, t.id.clock + n)), t.write(e.encoder, n), e.written++;
}, sa = (e) => {
	aa(e);
	let t = e.encoder.restEncoder;
	x(t, e.clientStructs.length);
	for (let n = 0; n < e.clientStructs.length; n++) {
		let r = e.clientStructs[n];
		x(t, r.written), Te(t, r.restEncoder);
	}
}, ca = "You must not compute changes after the event-handler fired.", la = class {
	constructor(e, t) {
		this.target = e, this.currentTarget = e, this.transaction = t, this._changes = null, this._keys = null, this._delta = null, this._path = null;
	}
	get path() {
		return this._path ||= ua(this.currentTarget, this.target);
	}
	deletes(e) {
		return Rr(this.transaction.deleteSet, e.id);
	}
	get keys() {
		if (this._keys === null) {
			if (this.transaction.doc._transactionCleanups.length === 0) throw Be(ca);
			let e = /* @__PURE__ */ new Map(), t = this.target;
			this.transaction.changed.get(t).forEach((n) => {
				if (n !== null) {
					let r = t._map.get(n), i, a;
					if (this.adds(r)) {
						let e = r.left;
						for (; e !== null && this.adds(e);) e = e.left;
						if (this.deletes(r)) {
							if (e !== null && this.deletes(e)) i = "delete", a = o(e.content.getContent());
							else return;
						} else e !== null && this.deletes(e) ? (i = "update", a = o(e.content.getContent())) : (i = "add", a = void 0);
					} else if (this.deletes(r)) i = "delete", a = o(r.content.getContent());
					else return;
					e.set(n, {
						action: i,
						oldValue: a
					});
				}
			}), this._keys = e;
		}
		return this._keys;
	}
	get delta() {
		return this.changes.delta;
	}
	adds(e) {
		return e.id.clock >= (this.transaction.beforeState.get(e.id.client) || 0);
	}
	get changes() {
		let e = this._changes;
		if (e === null) {
			if (this.transaction.doc._transactionCleanups.length === 0) throw Be(ca);
			let t = this.target, n = a(), r = a(), i = [];
			if (e = {
				added: n,
				deleted: r,
				delta: i,
				keys: this.keys
			}, this.transaction.changed.get(t).has(null)) {
				let e = null, a = () => {
					e && i.push(e);
				};
				for (let i = t._start; i !== null; i = i.right) i.deleted ? this.deletes(i) && !this.adds(i) && ((e === null || e.delete === void 0) && (a(), e = { delete: 0 }), e.delete += i.length, r.add(i)) : this.adds(i) ? ((e === null || e.insert === void 0) && (a(), e = { insert: [] }), e.insert = e.insert.concat(i.content.getContent()), n.add(i)) : ((e === null || e.retain === void 0) && (a(), e = { retain: 0 }), e.retain += i.length);
				e !== null && e.retain === void 0 && a();
			}
			this._changes = e;
		}
		return e;
	}
}, ua = (e, t) => {
	let n = [];
	for (; t._item !== null && t !== e;) {
		if (t._item.parentSub !== null) n.unshift(t._item.parentSub);
		else {
			let e = 0, r = t._item.parent._start;
			for (; r !== t._item && r !== null;) !r.deleted && r.countable && (e += r.length), r = r.right;
			n.unshift(e);
		}
		t = t._item.parent;
	}
	return n;
}, da = () => {
	kr("Invalid access: Add Yjs type to a document before reading data.");
}, fa = 80, pa = 0, ma = class {
	constructor(e, t) {
		e.marker = !0, this.p = e, this.index = t, this.timestamp = pa++;
	}
}, ha = (e) => {
	e.timestamp = pa++;
}, ga = (e, t, n) => {
	e.p.marker = !1, e.p = t, t.marker = !0, e.index = n, e.timestamp = pa++;
}, _a = (e, t, n) => {
	if (e.length >= fa) {
		let r = e.reduce((e, t) => e.timestamp < t.timestamp ? e : t);
		return ga(r, t, n), r;
	}
	{
		let r = new ma(t, n);
		return e.push(r), r;
	}
}, va = (e, t) => {
	if (e._start === null || t === 0 || e._searchMarker === null) return null;
	let n = e._searchMarker.length === 0 ? null : e._searchMarker.reduce((e, n) => h(t - e.index) < h(t - n.index) ? e : n), r = e._start, i = 0;
	for (n !== null && (r = n.p, i = n.index, ha(n)); r.right !== null && i < t;) {
		if (!r.deleted && r.countable) {
			if (t < i + r.length) break;
			i += r.length;
		}
		r = r.right;
	}
	for (; r.left !== null && i > t;) r = r.left, !r.deleted && r.countable && (i -= r.length);
	for (; r.left !== null && r.left.id.client === r.id.client && r.left.id.clock + r.left.length === r.id.clock;) r = r.left, !r.deleted && r.countable && (i -= r.length);
	return n !== null && h(n.index - i) < r.parent.length / fa ? (ga(n, r, i), n) : _a(e._searchMarker, r, i);
}, ya = (e, t, n) => {
	for (let r = e.length - 1; r >= 0; r--) {
		let i = e[r];
		if (n > 0) {
			let t = i.p;
			for (t.marker = !1; t && (t.deleted || !t.countable);) t = t.left, t && !t.deleted && t.countable && (i.index -= t.length);
			if (t === null || t.marker === !0) {
				e.splice(r, 1);
				continue;
			}
			i.p = t, t.marker = !0;
		}
		(t < i.index || n > 0 && t === i.index) && (i.index = _(t, i.index + n));
	}
}, ba = (e, t, r) => {
	let i = e, a = t.changedParentTypes;
	for (; n(a, e, () => []).push(r), e._item !== null;) e = e._item.parent;
	hi(i._eH, r, t);
}, k = class {
	constructor() {
		this._item = null, this._map = /* @__PURE__ */ new Map(), this._start = null, this.doc = null, this._length = 0, this._eH = fi(), this._dEH = fi(), this._searchMarker = null;
	}
	get parent() {
		return this._item ? this._item.parent : null;
	}
	_integrate(e, t) {
		this.doc = e, this._item = t;
	}
	_copy() {
		throw Ve();
	}
	clone() {
		throw Ve();
	}
	_write(e) {}
	get _first() {
		let e = this._start;
		for (; e !== null && e.deleted;) e = e.right;
		return e;
	}
	_callObserver(e, t) {
		!e.local && this._searchMarker && (this._searchMarker.length = 0);
	}
	observe(e) {
		pi(this._eH, e);
	}
	observeDeep(e) {
		pi(this._dEH, e);
	}
	unobserve(e) {
		mi(this._eH, e);
	}
	unobserveDeep(e) {
		mi(this._dEH, e);
	}
	toJSON() {}
}, xa = (e, t, n) => {
	e.doc ?? da(), t < 0 && (t = e._length + t), n < 0 && (n = e._length + n);
	let r = n - t, i = [], a = e._start;
	for (; a !== null && r > 0;) {
		if (a.countable && !a.deleted) {
			let e = a.content.getContent();
			if (e.length <= t) t -= e.length;
			else {
				for (let n = t; n < e.length && r > 0; n++) i.push(e[n]), r--;
				t = 0;
			}
		}
		a = a.right;
	}
	return i;
}, Sa = (e) => {
	e.doc ?? da();
	let t = [], n = e._start;
	for (; n !== null;) {
		if (n.countable && !n.deleted) {
			let e = n.content.getContent();
			for (let n = 0; n < e.length; n++) t.push(e[n]);
		}
		n = n.right;
	}
	return t;
}, Ca = (e, t) => {
	let n = [], r = e._start;
	for (; r !== null;) {
		if (r.countable && ji(r, t)) {
			let e = r.content.getContent();
			for (let t = 0; t < e.length; t++) n.push(e[t]);
		}
		r = r.right;
	}
	return n;
}, wa = (e, t) => {
	let n = 0, r = e._start;
	for (e.doc ?? da(); r !== null;) {
		if (r.countable && !r.deleted) {
			let i = r.content.getContent();
			for (let r = 0; r < i.length; r++) t(i[r], n++, e);
		}
		r = r.right;
	}
}, Ta = (e, t) => {
	let n = [];
	return wa(e, (r, i) => {
		n.push(t(r, i, e));
	}), n;
}, Ea = (e) => {
	let t = e._start, n = null, r = 0;
	return {
		[Symbol.iterator]() {
			return this;
		},
		next: () => {
			if (n === null) {
				for (; t !== null && t.deleted;) t = t.right;
				if (t === null) return {
					done: !0,
					value: void 0
				};
				n = t.content.getContent(), r = 0, t = t.right;
			}
			let e = n[r++];
			return n.length <= r && (n = null), {
				done: !1,
				value: e
			};
		}
	};
}, Da = (e, t) => {
	e.doc ?? da();
	let n = va(e, t), r = e._start;
	for (n !== null && (r = n.p, t -= n.index); r !== null; r = r.right) if (!r.deleted && r.countable) {
		if (t < r.length) return r.content.getContent()[t];
		t -= r.length;
	}
}, Oa = (e, t, n, r) => {
	let i = n, a = e.doc, o = a.clientID, s = a.store, c = n === null ? t._start : n.right, l = [], u = () => {
		l.length > 0 && (i = new j(E(o, D(s, o)), i, i && i.lastId, c, c && c.id, t, null, new Lo(l)), i.integrate(e, 0), l = []);
	};
	r.forEach((n) => {
		if (n === null) l.push(n);
		else switch (n.constructor) {
			case Number:
			case Object:
			case Boolean:
			case Array:
			case String:
				l.push(n);
				break;
			default: switch (u(), n.constructor) {
				case Uint8Array:
				case ArrayBuffer:
					i = new j(E(o, D(s, o)), i, i && i.lastId, c, c && c.id, t, null, new Co(new Uint8Array(n))), i.integrate(e, 0);
					break;
				case Jr:
					i = new j(E(o, D(s, o)), i, i && i.lastId, c, c && c.id, t, null, new Oo(n)), i.integrate(e, 0);
					break;
				default: if (n instanceof k) i = new j(E(o, D(s, o)), i, i && i.lastId, c, c && c.id, t, null, new Yo(n)), i.integrate(e, 0);
				else throw Error("Unexpected content type in insert operation");
			}
		}
	}), u();
}, ka = () => Be("Length exceeded!"), Aa = (e, t, n, r) => {
	if (n > t._length) throw ka();
	if (n === 0) return t._searchMarker && ya(t._searchMarker, n, r.length), Oa(e, t, null, r);
	let i = n, a = va(t, n), o = t._start;
	for (a !== null && (o = a.p, n -= a.index, n === 0 && (o = o.prev, n += o && o.countable && !o.deleted ? o.length : 0)); o !== null; o = o.right) if (!o.deleted && o.countable) {
		if (n <= o.length) {
			n < o.length && zi(e, E(o.id.client, o.id.clock + n));
			break;
		}
		n -= o.length;
	}
	return t._searchMarker && ya(t._searchMarker, i, r.length), Oa(e, t, o, r);
}, ja = (e, t, n) => {
	let r = (t._searchMarker || []).reduce((e, t) => t.index > e.index ? t : e, {
		index: 0,
		p: t._start
	}).p;
	if (r) for (; r.right;) r = r.right;
	return Oa(e, t, r, n);
}, Ma = (e, t, n, r) => {
	if (r === 0) return;
	let i = n, a = r, o = va(t, n), s = t._start;
	for (o !== null && (s = o.p, n -= o.index); s !== null && n > 0; s = s.right) !s.deleted && s.countable && (n < s.length && zi(e, E(s.id.client, s.id.clock + n)), n -= s.length);
	for (; r > 0 && s !== null;) s.deleted || (r < s.length && zi(e, E(s.id.client, s.id.clock + r)), s.delete(e), r -= s.length), s = s.right;
	if (r > 0) throw ka();
	t._searchMarker && ya(t._searchMarker, i, -a + r);
}, Na = (e, t, n) => {
	let r = t._map.get(n);
	r !== void 0 && r.delete(e);
}, Pa = (e, t, n, r) => {
	let i = t._map.get(n) || null, a = e.doc, o = a.clientID, s;
	if (r == null) s = new Lo([r]);
	else switch (r.constructor) {
		case Number:
		case Object:
		case Boolean:
		case Array:
		case String:
		case Date:
		case BigInt:
			s = new Lo([r]);
			break;
		case Uint8Array:
			s = new Co(r);
			break;
		case Jr:
			s = new Oo(r);
			break;
		default: if (r instanceof k) s = new Yo(r);
		else throw Error("Unexpected content type");
	}
	new j(E(o, D(a.store, o)), i, i && i.lastId, null, null, t, n, s).integrate(e, 0);
}, Fa = (e, t) => {
	e.doc ?? da();
	let n = e._map.get(t);
	return n !== void 0 && !n.deleted ? n.content.getContent()[n.length - 1] : void 0;
}, Ia = (e) => {
	let t = {};
	return e.doc ?? da(), e._map.forEach((e, n) => {
		e.deleted || (t[n] = e.content.getContent()[e.length - 1]);
	}), t;
}, La = (e, t) => {
	e.doc ?? da();
	let n = e._map.get(t);
	return n !== void 0 && !n.deleted;
}, Ra = (e, t) => {
	let n = {};
	return e._map.forEach((e, r) => {
		let i = e;
		for (; i !== null && (!t.sv.has(i.id.client) || i.id.clock >= (t.sv.get(i.id.client) || 0));) i = i.left;
		i !== null && ji(i, t) && (n[r] = i.content.getContent()[i.length - 1]);
	}), n;
}, za = (e) => (e.doc ?? da(), Mr(e._map.entries(), (e) => !e[1].deleted)), Ba = class extends la {}, Va = class e extends k {
	constructor() {
		super(), this._prelimContent = [], this._searchMarker = [];
	}
	static from(t) {
		let n = new e();
		return n.push(t), n;
	}
	_integrate(e, t) {
		super._integrate(e, t), this.insert(0, this._prelimContent), this._prelimContent = null;
	}
	_copy() {
		return new e();
	}
	clone() {
		let t = new e();
		return t.insert(0, this.toArray().map((e) => e instanceof k ? e.clone() : e)), t;
	}
	get length() {
		return this.doc ?? da(), this._length;
	}
	_callObserver(e, t) {
		super._callObserver(e, t), ba(this, e, new Ba(this, e));
	}
	insert(e, t) {
		this.doc === null ? this._prelimContent.splice(e, 0, ...t) : O(this.doc, (n) => {
			Aa(n, this, e, t);
		});
	}
	push(e) {
		this.doc === null ? this._prelimContent.push(...e) : O(this.doc, (t) => {
			ja(t, this, e);
		});
	}
	unshift(e) {
		this.insert(0, e);
	}
	delete(e, t = 1) {
		this.doc === null ? this._prelimContent.splice(e, t) : O(this.doc, (n) => {
			Ma(n, this, e, t);
		});
	}
	get(e) {
		return Da(this, e);
	}
	toArray() {
		return Sa(this);
	}
	slice(e = 0, t = this.length) {
		return xa(this, e, t);
	}
	toJSON() {
		return this.map((e) => e instanceof k ? e.toJSON() : e);
	}
	map(e) {
		return Ta(this, e);
	}
	forEach(e) {
		wa(this, e);
	}
	[Symbol.iterator]() {
		return Ea(this);
	}
	_write(e) {
		e.writeTypeRef(Ho);
	}
}, Ha = (e) => new Va(), Ua = class extends la {
	constructor(e, t, n) {
		super(e, t), this.keysChanged = n;
	}
}, Wa = class e extends k {
	constructor(e) {
		super(), this._prelimContent = null, this._prelimContent = e === void 0 ? /* @__PURE__ */ new Map() : new Map(e);
	}
	_integrate(e, t) {
		super._integrate(e, t), this._prelimContent.forEach((e, t) => {
			this.set(t, e);
		}), this._prelimContent = null;
	}
	_copy() {
		return new e();
	}
	clone() {
		let t = new e();
		return this.forEach((e, n) => {
			t.set(n, e instanceof k ? e.clone() : e);
		}), t;
	}
	_callObserver(e, t) {
		ba(this, e, new Ua(this, e, t));
	}
	toJSON() {
		this.doc ?? da();
		let e = {};
		return this._map.forEach((t, n) => {
			if (!t.deleted) {
				let r = t.content.getContent()[t.length - 1];
				e[n] = r instanceof k ? r.toJSON() : r;
			}
		}), e;
	}
	get size() {
		return [...za(this)].length;
	}
	keys() {
		return Nr(za(this), (e) => e[0]);
	}
	values() {
		return Nr(za(this), (e) => e[1].content.getContent()[e[1].length - 1]);
	}
	entries() {
		return Nr(za(this), (e) => [e[0], e[1].content.getContent()[e[1].length - 1]]);
	}
	forEach(e) {
		this.doc ?? da(), this._map.forEach((t, n) => {
			t.deleted || e(t.content.getContent()[t.length - 1], n, this);
		});
	}
	[Symbol.iterator]() {
		return this.entries();
	}
	delete(e) {
		this.doc === null ? this._prelimContent.delete(e) : O(this.doc, (t) => {
			Na(t, this, e);
		});
	}
	set(e, t) {
		return this.doc === null ? this._prelimContent.set(e, t) : O(this.doc, (n) => {
			Pa(n, this, e, t);
		}), t;
	}
	get(e) {
		return Fa(this, e);
	}
	has(e) {
		return La(this, e);
	}
	clear() {
		this.doc === null ? this._prelimContent.clear() : O(this.doc, (e) => {
			this.forEach(function(t, n, r) {
				Na(e, r, n);
			});
		});
	}
	_write(e) {
		e.writeTypeRef(Uo);
	}
}, Ga = (e) => new Wa(), Ka = (e, t) => e === t || typeof e == "object" && typeof t == "object" && e && t && Ot(e, t), qa = class {
	constructor(e, t, n, r) {
		this.left = e, this.right = t, this.index = n, this.currentAttributes = r;
	}
	forward() {
		switch (this.right === null && S(), this.right.content.constructor) {
			case Mo:
				this.right.deleted || Za(this.currentAttributes, this.right.content);
				break;
			default: this.right.deleted || (this.index += this.right.length);
		}
		this.left = this.right, this.right = this.right.right;
	}
}, Ja = (e, t, n) => {
	for (; t.right !== null && n > 0;) {
		switch (t.right.content.constructor) {
			case Mo:
				t.right.deleted || Za(t.currentAttributes, t.right.content);
				break;
			default: t.right.deleted || (n < t.right.length && zi(e, E(t.right.id.client, t.right.id.clock + n)), t.index += t.right.length, n -= t.right.length);
		}
		t.left = t.right, t.right = t.right.right;
	}
	return t;
}, Ya = (e, t, n, r) => {
	let i = /* @__PURE__ */ new Map(), a = r ? va(t, n) : null;
	return a ? Ja(e, new qa(a.p.left, a.p, a.index, i), n - a.index) : Ja(e, new qa(null, t._start, 0, i), n);
}, Xa = (e, t, n, r) => {
	for (; n.right !== null && (n.right.deleted === !0 || n.right.content.constructor === Mo && Ka(r.get(n.right.content.key), n.right.content.value));) n.right.deleted || r.delete(n.right.content.key), n.forward();
	let i = e.doc, a = i.clientID;
	r.forEach((r, o) => {
		let s = n.left, c = n.right, l = new j(E(a, D(i.store, a)), s, s && s.lastId, c, c && c.id, t, null, new Mo(o, r));
		l.integrate(e, 0), n.right = l, n.forward();
	});
}, Za = (e, t) => {
	let { key: n, value: r } = t;
	r === null ? e.delete(n) : e.set(n, r);
}, Qa = (e, t) => {
	for (; e.right !== null && (e.right.deleted || e.right.content.constructor === Mo && Ka(t[e.right.content.key] ?? null, e.right.content.value));) e.forward();
}, $a = (e, t, n, r) => {
	let i = e.doc, a = i.clientID, o = /* @__PURE__ */ new Map();
	for (let s in r) {
		let c = r[s], l = n.currentAttributes.get(s) ?? null;
		if (!Ka(l, c)) {
			o.set(s, l);
			let { left: r, right: u } = n;
			n.right = new j(E(a, D(i.store, a)), r, r && r.lastId, u, u && u.id, t, null, new Mo(s, c)), n.right.integrate(e, 0), n.forward();
		}
	}
	return o;
}, eo = (e, t, n, r, i) => {
	n.currentAttributes.forEach((e, t) => {
		i[t] === void 0 && (i[t] = null);
	});
	let a = e.doc, o = a.clientID;
	Qa(n, i);
	let s = $a(e, t, n, i), c = r.constructor === String ? new zo(r) : r instanceof k ? new Yo(r) : new Ao(r), { left: l, right: u, index: d } = n;
	t._searchMarker && ya(t._searchMarker, n.index, c.getLength()), u = new j(E(o, D(a.store, o)), l, l && l.lastId, u, u && u.id, t, null, c), u.integrate(e, 0), n.right = u, n.index = d, n.forward(), Xa(e, t, n, s);
}, to = (e, t, n, r, i) => {
	let a = e.doc, o = a.clientID;
	Qa(n, i);
	let s = $a(e, t, n, i);
	iterationLoop: for (; n.right !== null && (r > 0 || s.size > 0 && (n.right.deleted || n.right.content.constructor === Mo));) {
		if (!n.right.deleted) switch (n.right.content.constructor) {
			case Mo: {
				let { key: t, value: a } = n.right.content, o = i[t];
				if (o !== void 0) {
					if (Ka(o, a)) s.delete(t);
					else {
						if (r === 0) break iterationLoop;
						s.set(t, a);
					}
					n.right.delete(e);
				} else n.currentAttributes.set(t, a);
				break;
			}
			default: r < n.right.length && zi(e, E(n.right.id.client, n.right.id.clock + r)), r -= n.right.length;
		}
		n.forward();
	}
	if (r > 0) {
		let i = "";
		for (; r > 0; r--) i += "\n";
		n.right = new j(E(o, D(a.store, o)), n.left, n.left && n.left.lastId, n.right, n.right && n.right.id, t, null, new zo(i)), n.right.integrate(e, 0), n.forward();
	}
	Xa(e, t, n, s);
}, no = (t, n, r, i, a) => {
	let o = n, s = e();
	for (; o && (!o.countable || o.deleted);) {
		if (!o.deleted && o.content.constructor === Mo) {
			let e = o.content;
			s.set(e.key, e);
		}
		o = o.right;
	}
	let c = 0, l = !1;
	for (; n !== o;) {
		if (r === n && (l = !0), !n.deleted) {
			let e = n.content;
			switch (e.constructor) {
				case Mo: {
					let { key: r, value: o } = e, u = i.get(r) ?? null;
					(s.get(r) !== e || u === o) && (n.delete(t), c++, !l && (a.get(r) ?? null) === o && u !== o && (u === null ? a.delete(r) : a.set(r, u))), !l && !n.deleted && Za(a, e);
					break;
				}
			}
		}
		n = n.right;
	}
	return c;
}, ro = (e, t) => {
	for (; t && t.right && (t.right.deleted || !t.right.countable);) t = t.right;
	let n = /* @__PURE__ */ new Set();
	for (; t && (t.deleted || !t.countable);) {
		if (!t.deleted && t.content.constructor === Mo) {
			let r = t.content.key;
			n.has(r) ? t.delete(e) : n.add(r);
		}
		t = t.left;
	}
}, io = (n) => {
	let r = 0;
	return O(n.doc, (i) => {
		let a = n._start, o = n._start, s = e(), c = t(s);
		for (; o;) {
			if (o.deleted === !1) switch (o.content.constructor) {
				case Mo:
					Za(c, o.content);
					break;
				default: r += no(i, a, o, s, c), s = t(c), a = o;
			}
			o = o.right;
		}
	}), r;
}, ao = (e) => {
	let t = /* @__PURE__ */ new Set(), n = e.doc;
	for (let [r, i] of e.afterState.entries()) {
		let a = e.beforeState.get(r) || 0;
		i !== a && Hi(e, n.store.clients.get(r), a, i, (e) => {
			!e.deleted && e.content.constructor === Mo && e.constructor !== So && t.add(e.parent);
		});
	}
	O(n, (n) => {
		Ir(e, e.deleteSet, (e) => {
			if (e instanceof So || !e.parent._hasFormatting || t.has(e.parent)) return;
			let r = e.parent;
			e.content.constructor === Mo ? t.add(r) : ro(n, e);
		});
		for (let e of t) io(e);
	});
}, oo = (e, n, r) => {
	let i = r, a = t(n.currentAttributes), o = n.right;
	for (; r > 0 && n.right !== null;) {
		if (n.right.deleted === !1) switch (n.right.content.constructor) {
			case Yo:
			case Ao:
			case zo: r < n.right.length && zi(e, E(n.right.id.client, n.right.id.clock + r)), r -= n.right.length, n.right.delete(e);
		}
		n.forward();
	}
	o && no(e, o, n.right, a, n.currentAttributes);
	let s = (n.left || n.right).parent;
	return s._searchMarker && ya(s._searchMarker, n.index, -i + r), n;
}, so = class extends la {
	constructor(e, t, n) {
		super(e, t), this.childListChanged = !1, this.keysChanged = /* @__PURE__ */ new Set(), n.forEach((e) => {
			e === null ? this.childListChanged = !0 : this.keysChanged.add(e);
		});
	}
	get changes() {
		if (this._changes === null) {
			let e = {
				keys: this.keys,
				delta: this.delta,
				added: /* @__PURE__ */ new Set(),
				deleted: /* @__PURE__ */ new Set()
			};
			this._changes = e;
		}
		return this._changes;
	}
	get delta() {
		if (this._delta === null) {
			let e = this.target.doc, t = [];
			O(e, (e) => {
				let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), i = this.target._start, a = null, o = {}, s = "", c = 0, l = 0, u = () => {
					if (a !== null) {
						let e = null;
						switch (a) {
							case "delete":
								l > 0 && (e = { delete: l }), l = 0;
								break;
							case "insert":
								(typeof s == "object" || s.length > 0) && (e = { insert: s }, n.size > 0 && (e.attributes = {}, n.forEach((t, n) => {
									t !== null && (e.attributes[n] = t);
								}))), s = "";
								break;
							case "retain": c > 0 && (e = { retain: c }, Tt(o) || (e.attributes = xt({}, o))), c = 0;
						}
						e && t.push(e), a = null;
					}
				};
				for (; i !== null;) {
					switch (i.content.constructor) {
						case Yo:
						case Ao:
							this.adds(i) ? this.deletes(i) || (u(), a = "insert", s = i.content.getContent()[0], u()) : this.deletes(i) ? (a !== "delete" && (u(), a = "delete"), l += 1) : i.deleted || (a !== "retain" && (u(), a = "retain"), c += 1);
							break;
						case zo:
							this.adds(i) ? this.deletes(i) || (a !== "insert" && (u(), a = "insert"), s += i.content.str) : this.deletes(i) ? (a !== "delete" && (u(), a = "delete"), l += i.length) : i.deleted || (a !== "retain" && (u(), a = "retain"), c += i.length);
							break;
						case Mo: {
							let { key: t, value: s } = i.content;
							if (this.adds(i)) this.deletes(i) || (Ka(n.get(t) ?? null, s) ? s !== null && i.delete(e) : (a === "retain" && u(), Ka(s, r.get(t) ?? null) ? delete o[t] : o[t] = s));
							else if (this.deletes(i)) {
								r.set(t, s);
								let e = n.get(t) ?? null;
								Ka(e, s) || (a === "retain" && u(), o[t] = e);
							} else if (!i.deleted) {
								r.set(t, s);
								let n = o[t];
								n !== void 0 && (Ka(n, s) ? n !== null && i.delete(e) : (a === "retain" && u(), s === null ? delete o[t] : o[t] = s));
							}
							i.deleted || (a === "insert" && u(), Za(n, i.content));
							break;
						}
					}
					i = i.right;
				}
				for (u(); t.length > 0;) {
					let e = t[t.length - 1];
					if (e.retain !== void 0 && e.attributes === void 0) t.pop();
					else break;
				}
			}), this._delta = t;
		}
		return this._delta;
	}
}, co = class e extends k {
	constructor(e) {
		super(), this._pending = e === void 0 ? [] : [() => this.insert(0, e)], this._searchMarker = [], this._hasFormatting = !1;
	}
	get length() {
		return this.doc ?? da(), this._length;
	}
	_integrate(e, t) {
		super._integrate(e, t);
		try {
			this._pending.forEach((e) => e());
		} catch (e) {
			console.error(e);
		}
		this._pending = null;
	}
	_copy() {
		return new e();
	}
	clone() {
		let t = new e();
		return t.applyDelta(this.toDelta()), t;
	}
	_callObserver(e, t) {
		super._callObserver(e, t);
		let n = new so(this, e, t);
		ba(this, e, n), !e.local && this._hasFormatting && (e._needFormattingCleanup = !0);
	}
	toString() {
		this.doc ?? da();
		let e = "", t = this._start;
		for (; t !== null;) !t.deleted && t.countable && t.content.constructor === zo && (e += t.content.str), t = t.right;
		return e;
	}
	toJSON() {
		return this.toString();
	}
	applyDelta(e, { sanitize: t = !0 } = {}) {
		this.doc === null ? this._pending.push(() => this.applyDelta(e)) : O(this.doc, (n) => {
			let r = new qa(null, this._start, 0, /* @__PURE__ */ new Map());
			for (let i = 0; i < e.length; i++) {
				let a = e[i];
				if (a.insert !== void 0) {
					let o = !t && typeof a.insert == "string" && i === e.length - 1 && r.right === null && a.insert.slice(-1) === "\n" ? a.insert.slice(0, -1) : a.insert;
					(typeof o != "string" || o.length > 0) && eo(n, this, r, o, a.attributes || {});
				} else a.retain === void 0 ? a.delete !== void 0 && oo(n, r, a.delete) : to(n, this, r, a.retain, a.attributes || {});
			}
		});
	}
	toDelta(e, t, n) {
		this.doc ?? da();
		let r = [], i = /* @__PURE__ */ new Map(), a = this.doc, o = "", s = this._start;
		function c() {
			if (o.length > 0) {
				let e = {}, t = !1;
				i.forEach((n, r) => {
					t = !0, e[r] = n;
				});
				let n = { insert: o };
				t && (n.attributes = e), r.push(n), o = "";
			}
		}
		let l = () => {
			for (; s !== null;) {
				if (ji(s, e) || t !== void 0 && ji(s, t)) switch (s.content.constructor) {
					case zo: {
						let r = i.get("ychange");
						e !== void 0 && !ji(s, e) ? (r === void 0 || r.user !== s.id.client || r.type !== "removed") && (c(), i.set("ychange", n ? n("removed", s.id) : { type: "removed" })) : t !== void 0 && !ji(s, t) ? (r === void 0 || r.user !== s.id.client || r.type !== "added") && (c(), i.set("ychange", n ? n("added", s.id) : { type: "added" })) : r !== void 0 && (c(), i.delete("ychange")), o += s.content.str;
						break;
					}
					case Yo:
					case Ao: {
						c();
						let e = { insert: s.content.getContent()[0] };
						if (i.size > 0) {
							let t = {};
							e.attributes = t, i.forEach((e, n) => {
								t[n] = e;
							});
						}
						r.push(e);
						break;
					}
					case Mo: ji(s, e) && (c(), Za(i, s.content));
				}
				s = s.right;
			}
			c();
		};
		return e || t ? O(a, (n) => {
			e && Mi(n, e), t && Mi(n, t), l();
		}, "cleanup") : l(), r;
	}
	insert(e, t, n) {
		if (t.length <= 0) return;
		let r = this.doc;
		r === null ? this._pending.push(() => this.insert(e, t, n)) : O(r, (r) => {
			let i = Ya(r, this, e, !n);
			n || (n = {}, i.currentAttributes.forEach((e, t) => {
				n[t] = e;
			})), eo(r, this, i, t, n);
		});
	}
	insertEmbed(e, t, n) {
		let r = this.doc;
		r === null ? this._pending.push(() => this.insertEmbed(e, t, n || {})) : O(r, (r) => {
			let i = Ya(r, this, e, !n);
			eo(r, this, i, t, n || {});
		});
	}
	delete(e, t) {
		if (t === 0) return;
		let n = this.doc;
		n === null ? this._pending.push(() => this.delete(e, t)) : O(n, (n) => {
			oo(n, Ya(n, this, e, !0), t);
		});
	}
	format(e, t, n) {
		if (t === 0) return;
		let r = this.doc;
		r === null ? this._pending.push(() => this.format(e, t, n)) : O(r, (r) => {
			let i = Ya(r, this, e, !1);
			i.right !== null && to(r, this, i, t, n);
		});
	}
	removeAttribute(e) {
		this.doc === null ? this._pending.push(() => this.removeAttribute(e)) : O(this.doc, (t) => {
			Na(t, this, e);
		});
	}
	setAttribute(e, t) {
		this.doc === null ? this._pending.push(() => this.setAttribute(e, t)) : O(this.doc, (n) => {
			Pa(n, this, e, t);
		});
	}
	getAttribute(e) {
		return Fa(this, e);
	}
	getAttributes() {
		return Ia(this);
	}
	_write(e) {
		e.writeTypeRef(Wo);
	}
}, lo = (e) => new co(), uo = class {
	constructor(e, t = () => !0) {
		this._filter = t, this._root = e, this._currentNode = e._start, this._firstCall = !0, e.doc ?? da();
	}
	[Symbol.iterator]() {
		return this;
	}
	next() {
		let e = this._currentNode, t = e && e.content && e.content.type;
		if (e !== null && (!this._firstCall || e.deleted || !this._filter(t))) do
			if (t = e.content.type, !e.deleted && (t.constructor === A || t.constructor === fo) && t._start !== null) e = t._start;
			else for (; e !== null;) {
				let t = e.next;
				if (t !== null) {
					e = t;
					break;
				}
				e = e.parent === this._root ? null : e.parent._item;
			}
		while (e !== null && (e.deleted || !this._filter(e.content.type)));
		return this._firstCall = !1, e === null ? {
			value: void 0,
			done: !0
		} : (this._currentNode = e, {
			value: e.content.type,
			done: !1
		});
	}
}, fo = class e extends k {
	constructor() {
		super(), this._prelimContent = [];
	}
	get firstChild() {
		let e = this._first;
		return e ? e.content.getContent()[0] : null;
	}
	_integrate(e, t) {
		super._integrate(e, t), this.insert(0, this._prelimContent), this._prelimContent = null;
	}
	_copy() {
		return new e();
	}
	clone() {
		let t = new e();
		return t.insert(0, this.toArray().map((e) => e instanceof k ? e.clone() : e)), t;
	}
	get length() {
		return this.doc ?? da(), this._prelimContent === null ? this._length : this._prelimContent.length;
	}
	createTreeWalker(e) {
		return new uo(this, e);
	}
	querySelector(e) {
		e = e.toUpperCase();
		let t = new uo(this, (t) => t.nodeName && t.nodeName.toUpperCase() === e).next();
		return t.done ? null : t.value;
	}
	querySelectorAll(e) {
		return e = e.toUpperCase(), c(new uo(this, (t) => t.nodeName && t.nodeName.toUpperCase() === e));
	}
	_callObserver(e, t) {
		ba(this, e, new ho(this, t, e));
	}
	toString() {
		return Ta(this, (e) => e.toString()).join("");
	}
	toJSON() {
		return this.toString();
	}
	toDOM(e = document, t = {}, n) {
		let r = e.createDocumentFragment();
		return n !== void 0 && n._createAssociation(r, this), wa(this, (i) => {
			r.insertBefore(i.toDOM(e, t, n), null);
		}), r;
	}
	insert(e, t) {
		this.doc === null ? this._prelimContent.splice(e, 0, ...t) : O(this.doc, (n) => {
			Aa(n, this, e, t);
		});
	}
	insertAfter(e, t) {
		if (this.doc !== null) O(this.doc, (n) => {
			let r = e && e instanceof k ? e._item : e;
			Oa(n, this, r, t);
		});
		else {
			let n = this._prelimContent, r = e === null ? 0 : n.findIndex((t) => t === e) + 1;
			if (r === 0 && e !== null) throw Be("Reference item not found");
			n.splice(r, 0, ...t);
		}
	}
	delete(e, t = 1) {
		this.doc === null ? this._prelimContent.splice(e, t) : O(this.doc, (n) => {
			Ma(n, this, e, t);
		});
	}
	toArray() {
		return Sa(this);
	}
	push(e) {
		this.insert(this.length, e);
	}
	unshift(e) {
		this.insert(0, e);
	}
	get(e) {
		return Da(this, e);
	}
	slice(e = 0, t = this.length) {
		return xa(this, e, t);
	}
	forEach(e) {
		wa(this, e);
	}
	_write(e) {
		e.writeTypeRef(Ko);
	}
}, po = (e) => new fo(), A = class e extends fo {
	constructor(e = "UNDEFINED") {
		super(), this.nodeName = e, this._prelimAttrs = /* @__PURE__ */ new Map();
	}
	get nextSibling() {
		let e = this._item ? this._item.next : null;
		return e ? e.content.type : null;
	}
	get prevSibling() {
		let e = this._item ? this._item.prev : null;
		return e ? e.content.type : null;
	}
	_integrate(e, t) {
		super._integrate(e, t), this._prelimAttrs.forEach((e, t) => {
			this.setAttribute(t, e);
		}), this._prelimAttrs = null;
	}
	_copy() {
		return new e(this.nodeName);
	}
	clone() {
		let t = new e(this.nodeName);
		return Ct(this.getAttributes(), (e, n) => {
			t.setAttribute(n, e);
		}), t.insert(0, this.toArray().map((e) => e instanceof k ? e.clone() : e)), t;
	}
	toString() {
		let e = this.getAttributes(), t = [], n = [];
		for (let t in e) n.push(t);
		n.sort();
		let r = n.length;
		for (let i = 0; i < r; i++) {
			let r = n[i];
			t.push(r + "=\"" + e[r] + "\"");
		}
		let i = this.nodeName.toLocaleLowerCase();
		return `<${i}${t.length > 0 ? " " + t.join(" ") : ""}>${super.toString()}</${i}>`;
	}
	removeAttribute(e) {
		this.doc === null ? this._prelimAttrs.delete(e) : O(this.doc, (t) => {
			Na(t, this, e);
		});
	}
	setAttribute(e, t) {
		this.doc === null ? this._prelimAttrs.set(e, t) : O(this.doc, (n) => {
			Pa(n, this, e, t);
		});
	}
	getAttribute(e) {
		return Fa(this, e);
	}
	hasAttribute(e) {
		return La(this, e);
	}
	getAttributes(e) {
		return e ? Ra(this, e) : Ia(this);
	}
	toDOM(e = document, t = {}, n) {
		let r = e.createElement(this.nodeName), i = this.getAttributes();
		for (let e in i) {
			let t = i[e];
			typeof t == "string" && r.setAttribute(e, t);
		}
		return wa(this, (i) => {
			r.appendChild(i.toDOM(e, t, n));
		}), n !== void 0 && n._createAssociation(r, this), r;
	}
	_write(e) {
		e.writeTypeRef(Go), e.writeKey(this.nodeName);
	}
}, mo = (e) => new A(e.readKey()), ho = class extends la {
	constructor(e, t, n) {
		super(e, n), this.childListChanged = !1, this.attributesChanged = /* @__PURE__ */ new Set(), t.forEach((e) => {
			e === null ? this.childListChanged = !0 : this.attributesChanged.add(e);
		});
	}
}, go = class e extends Wa {
	constructor(e) {
		super(), this.hookName = e;
	}
	_copy() {
		return new e(this.hookName);
	}
	clone() {
		let t = new e(this.hookName);
		return this.forEach((e, n) => {
			t.set(n, e);
		}), t;
	}
	toDOM(e = document, t = {}, n) {
		let r = t[this.hookName], i;
		return i = r === void 0 ? document.createElement(this.hookName) : r.createDom(this), i.setAttribute("data-yjs-hook", this.hookName), n !== void 0 && n._createAssociation(i, this), i;
	}
	_write(e) {
		e.writeTypeRef(qo), e.writeKey(this.hookName);
	}
}, _o = (e) => new go(e.readKey()), vo = class e extends co {
	get nextSibling() {
		let e = this._item ? this._item.next : null;
		return e ? e.content.type : null;
	}
	get prevSibling() {
		let e = this._item ? this._item.prev : null;
		return e ? e.content.type : null;
	}
	_copy() {
		return new e();
	}
	clone() {
		let t = new e();
		return t.applyDelta(this.toDelta()), t;
	}
	toDOM(e = document, t, n) {
		let r = e.createTextNode(this.toString());
		return n !== void 0 && n._createAssociation(r, this), r;
	}
	toString() {
		return this.toDelta().map((e) => {
			let t = [];
			for (let n in e.attributes) {
				let r = [];
				for (let t in e.attributes[n]) r.push({
					key: t,
					value: e.attributes[n][t]
				});
				r.sort((e, t) => e.key < t.key ? -1 : 1), t.push({
					nodeName: n,
					attrs: r
				});
			}
			t.sort((e, t) => e.nodeName < t.nodeName ? -1 : 1);
			let n = "";
			for (let e = 0; e < t.length; e++) {
				let r = t[e];
				n += `<${r.nodeName}`;
				for (let e = 0; e < r.attrs.length; e++) {
					let t = r.attrs[e];
					n += ` ${t.key}="${t.value}"`;
				}
				n += ">";
			}
			n += e.insert;
			for (let e = t.length - 1; e >= 0; e--) n += `</${t[e].nodeName}>`;
			return n;
		}).join("");
	}
	toJSON() {
		return this.toString();
	}
	_write(e) {
		e.writeTypeRef(Jo);
	}
}, yo = (e) => new vo(), bo = class {
	constructor(e, t) {
		this.id = e, this.length = t;
	}
	get deleted() {
		throw Ve();
	}
	mergeWith(e) {
		return !1;
	}
	write(e, t, n) {
		throw Ve();
	}
	integrate(e, t) {
		throw Ve();
	}
}, xo = 0, So = class extends bo {
	get deleted() {
		return !0;
	}
	delete() {}
	mergeWith(e) {
		return this.constructor === e.constructor && (this.length += e.length, !0);
	}
	integrate(e, t) {
		t > 0 && (this.id.clock += t, this.length -= t), Fi(e.doc.store, this);
	}
	write(e, t) {
		e.writeInfo(xo), e.writeLen(this.length - t);
	}
	getMissing(e, t) {
		return null;
	}
}, Co = class e {
	constructor(e) {
		this.content = e;
	}
	getLength() {
		return 1;
	}
	getContent() {
		return [this.content];
	}
	isCountable() {
		return !0;
	}
	copy() {
		return new e(this.content);
	}
	splice(e) {
		throw Ve();
	}
	mergeWith(e) {
		return !1;
	}
	integrate(e, t) {}
	delete(e) {}
	gc(e) {}
	write(e, t) {
		e.writeBuf(this.content);
	}
	getRef() {
		return 3;
	}
}, wo = (e) => new Co(e.readBuf()), To = class e {
	constructor(e) {
		this.len = e;
	}
	getLength() {
		return this.len;
	}
	getContent() {
		return [];
	}
	isCountable() {
		return !1;
	}
	copy() {
		return new e(this.len);
	}
	splice(t) {
		let n = new e(this.len - t);
		return this.len = t, n;
	}
	mergeWith(e) {
		return this.len += e.len, !0;
	}
	integrate(e, t) {
		Vr(e.deleteSet, t.id.client, t.id.clock, this.len), t.markDeleted();
	}
	delete(e) {}
	gc(e) {}
	write(e, t) {
		e.writeLen(this.len - t);
	}
	getRef() {
		return 1;
	}
}, Eo = (e) => new To(e.readLen()), Do = (e, t) => new Jr({
	guid: e,
	...t,
	shouldLoad: t.shouldLoad || t.autoLoad || !1
}), Oo = class e {
	constructor(e) {
		e._item && console.error("This document was already integrated as a sub-document. You should create a second instance instead with the same guid."), this.doc = e;
		let t = {};
		this.opts = t, e.gc || (t.gc = !1), e.autoLoad && (t.autoLoad = !0), e.meta !== null && (t.meta = e.meta);
	}
	getLength() {
		return 1;
	}
	getContent() {
		return [this.doc];
	}
	isCountable() {
		return !0;
	}
	copy() {
		return new e(Do(this.doc.guid, this.opts));
	}
	splice(e) {
		throw Ve();
	}
	mergeWith(e) {
		return !1;
	}
	integrate(e, t) {
		this.doc._item = t, e.subdocsAdded.add(this.doc), this.doc.shouldLoad && e.subdocsLoaded.add(this.doc);
	}
	delete(e) {
		e.subdocsAdded.has(this.doc) ? e.subdocsAdded.delete(this.doc) : e.subdocsRemoved.add(this.doc);
	}
	gc(e) {}
	write(e, t) {
		e.writeString(this.doc.guid), e.writeAny(this.opts);
	}
	getRef() {
		return 9;
	}
}, ko = (e) => new Oo(Do(e.readString(), e.readAny())), Ao = class e {
	constructor(e) {
		this.embed = e;
	}
	getLength() {
		return 1;
	}
	getContent() {
		return [this.embed];
	}
	isCountable() {
		return !0;
	}
	copy() {
		return new e(this.embed);
	}
	splice(e) {
		throw Ve();
	}
	mergeWith(e) {
		return !1;
	}
	integrate(e, t) {}
	delete(e) {}
	gc(e) {}
	write(e, t) {
		e.writeJSON(this.embed);
	}
	getRef() {
		return 5;
	}
}, jo = (e) => new Ao(e.readJSON()), Mo = class e {
	constructor(e, t) {
		this.key = e, this.value = t;
	}
	getLength() {
		return 1;
	}
	getContent() {
		return [];
	}
	isCountable() {
		return !1;
	}
	copy() {
		return new e(this.key, this.value);
	}
	splice(e) {
		throw Ve();
	}
	mergeWith(e) {
		return !1;
	}
	integrate(e, t) {
		let n = t.parent;
		n._searchMarker = null, n._hasFormatting = !0;
	}
	delete(e) {}
	gc(e) {}
	write(e, t) {
		e.writeKey(this.key), e.writeJSON(this.value);
	}
	getRef() {
		return 6;
	}
}, No = (e) => new Mo(e.readKey(), e.readJSON()), Po = class e {
	constructor(e) {
		this.arr = e;
	}
	getLength() {
		return this.arr.length;
	}
	getContent() {
		return this.arr;
	}
	isCountable() {
		return !0;
	}
	copy() {
		return new e(this.arr);
	}
	splice(t) {
		let n = new e(this.arr.slice(t));
		return this.arr = this.arr.slice(0, t), n;
	}
	mergeWith(e) {
		return this.arr = this.arr.concat(e.arr), !0;
	}
	integrate(e, t) {}
	delete(e) {}
	gc(e) {}
	write(e, t) {
		let n = this.arr.length;
		e.writeLen(n - t);
		for (let r = t; r < n; r++) {
			let t = this.arr[r];
			e.writeString(t === void 0 ? "undefined" : JSON.stringify(t));
		}
	}
	getRef() {
		return 2;
	}
}, Fo = (e) => {
	let t = e.readLen(), n = [];
	for (let r = 0; r < t; r++) {
		let t = e.readString();
		t === "undefined" ? n.push(void 0) : n.push(JSON.parse(t));
	}
	return new Po(n);
}, Io = Bt("node_env") === "development", Lo = class e {
	constructor(e) {
		this.arr = e, Io && At(e);
	}
	getLength() {
		return this.arr.length;
	}
	getContent() {
		return this.arr;
	}
	isCountable() {
		return !0;
	}
	copy() {
		return new e(this.arr);
	}
	splice(t) {
		let n = new e(this.arr.slice(t));
		return this.arr = this.arr.slice(0, t), n;
	}
	mergeWith(e) {
		return this.arr = this.arr.concat(e.arr), !0;
	}
	integrate(e, t) {}
	delete(e) {}
	gc(e) {}
	write(e, t) {
		let n = this.arr.length;
		e.writeLen(n - t);
		for (let r = t; r < n; r++) {
			let t = this.arr[r];
			e.writeAny(t);
		}
	}
	getRef() {
		return 8;
	}
}, Ro = (e) => {
	let t = e.readLen(), n = [];
	for (let r = 0; r < t; r++) n.push(e.readAny());
	return new Lo(n);
}, zo = class e {
	constructor(e) {
		this.str = e;
	}
	getLength() {
		return this.str.length;
	}
	getContent() {
		return this.str.split("");
	}
	isCountable() {
		return !0;
	}
	copy() {
		return new e(this.str);
	}
	splice(t) {
		let n = new e(this.str.slice(t));
		this.str = this.str.slice(0, t);
		let r = this.str.charCodeAt(t - 1);
		return r >= 55296 && r <= 56319 && (this.str = this.str.slice(0, t - 1) + "�", n.str = "�" + n.str.slice(1)), n;
	}
	mergeWith(e) {
		return this.str += e.str, !0;
	}
	integrate(e, t) {}
	delete(e) {}
	gc(e) {}
	write(e, t) {
		e.writeString(t === 0 ? this.str : this.str.slice(t));
	}
	getRef() {
		return 4;
	}
}, Bo = (e) => new zo(e.readString()), Vo = [
	Ha,
	Ga,
	lo,
	mo,
	po,
	_o,
	yo
], Ho = 0, Uo = 1, Wo = 2, Go = 3, Ko = 4, qo = 5, Jo = 6, Yo = class e {
	constructor(e) {
		this.type = e;
	}
	getLength() {
		return 1;
	}
	getContent() {
		return [this.type];
	}
	isCountable() {
		return !0;
	}
	copy() {
		return new e(this.type._copy());
	}
	splice(e) {
		throw Ve();
	}
	mergeWith(e) {
		return !1;
	}
	integrate(e, t) {
		this.type._integrate(e.doc, t);
	}
	delete(e) {
		let t = this.type._start;
		for (; t !== null;) t.deleted ? t.id.clock < (e.beforeState.get(t.id.client) || 0) && e._mergeStructs.push(t) : t.delete(e), t = t.right;
		this.type._map.forEach((t) => {
			t.deleted ? t.id.clock < (e.beforeState.get(t.id.client) || 0) && e._mergeStructs.push(t) : t.delete(e);
		}), e.changed.delete(this.type);
	}
	gc(e) {
		let t = this.type._start;
		for (; t !== null;) t.gc(e, !0), t = t.right;
		this.type._start = null, this.type._map.forEach((t) => {
			for (; t !== null;) t.gc(e, !0), t = t.left;
		}), this.type._map = /* @__PURE__ */ new Map();
	}
	write(e, t) {
		this.type._write(e);
	}
	getRef() {
		return 7;
	}
}, Xo = (e) => new Yo(Vo[e.readTypeRef()](e)), Zo = (e, t) => {
	let n = t, r = 0, i;
	do
		r > 0 && (n = E(n.client, n.clock + r)), i = Li(e, n), r = n.clock - i.id.clock, n = i.redone;
	while (n !== null && i instanceof j);
	return {
		item: i,
		diff: r
	};
}, Qo = (e, t) => {
	for (; e !== null && e.keep !== t;) e.keep = t, e = e.parent._item;
}, $o = (e, t, n) => {
	let { client: r, clock: i } = t.id, a = new j(E(r, i + n), t, E(r, i + n - 1), t.right, t.rightOrigin, t.parent, t.parentSub, t.content.splice(n));
	return t.deleted && a.markDeleted(), t.keep && (a.keep = !0), t.redone !== null && (a.redone = E(t.redone.client, t.redone.clock + n)), t.right = a, a.right !== null && (a.right.left = a), e._mergeStructs.push(a), a.parentSub !== null && a.right === null && a.parent._map.set(a.parentSub, a), t.length = n, a;
}, es = (e, t) => u(e, (e) => Rr(e.deletions, t)), ts = (e, t, n, r, i, a) => {
	let o = e.doc, s = o.store, c = o.clientID, l = t.redone;
	if (l !== null) return zi(e, l);
	let u = t.parent._item, d = null, f;
	if (u !== null && u.deleted === !0) {
		if (u.redone === null && (!n.has(u) || ts(e, u, n, r, i, a) === null)) return null;
		for (; u.redone !== null;) u = zi(e, u.redone);
	}
	let p = u === null ? t.parent : u.content.type;
	if (t.parentSub === null) {
		for (d = t.left, f = t; d !== null;) {
			let t = d;
			for (; t !== null && t.parent._item !== u;) t = t.redone === null ? null : zi(e, t.redone);
			if (t !== null && t.parent._item === u) {
				d = t;
				break;
			}
			d = d.left;
		}
		for (; f !== null;) {
			let t = f;
			for (; t !== null && t.parent._item !== u;) t = t.redone === null ? null : zi(e, t.redone);
			if (t !== null && t.parent._item === u) {
				f = t;
				break;
			}
			f = f.right;
		}
	} else {
		if (f = null, t.right && !i) {
			for (d = t; d !== null && d.right !== null && (d.right.redone || Rr(r, d.right.id) || es(a.undoStack, d.right.id) || es(a.redoStack, d.right.id));) for (d = d.right; d.redone;) d = zi(e, d.redone);
			if (d && d.right !== null) return null;
		} else d = p._map.get(t.parentSub) || null;
		d !== null && d.parent._item !== u && (d = p._map.get(t.parentSub) || null);
	}
	let m = E(c, D(s, c)), h = new j(m, d, d && d.lastId, f, f && f.id, p, t.parentSub, t.content.copy());
	return t.redone = m, Qo(h, !0), h.integrate(e, 0), h;
}, j = class e extends bo {
	constructor(e, t, n, r, i, a, o, s) {
		super(e, s.getLength()), this.origin = n, this.left = t, this.right = r, this.rightOrigin = i, this.parent = a, this.parentSub = o, this.redone = null, this.content = s, this.info = this.content.isCountable() ? 2 : 0;
	}
	set marker(e) {
		(this.info & 8) > 0 !== e && (this.info ^= 8);
	}
	get marker() {
		return (this.info & 8) > 0;
	}
	get keep() {
		return (this.info & 1) > 0;
	}
	set keep(e) {
		this.keep !== e && (this.info ^= 1);
	}
	get countable() {
		return (this.info & 2) > 0;
	}
	get deleted() {
		return (this.info & 4) > 0;
	}
	set deleted(e) {
		this.deleted !== e && (this.info ^= 4);
	}
	markDeleted() {
		this.info |= 4;
	}
	getMissing(t, n) {
		if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= D(n, this.origin.client)) return this.origin.client;
		if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= D(n, this.rightOrigin.client)) return this.rightOrigin.client;
		if (this.parent && this.parent.constructor === gi && this.id.client !== this.parent.client && this.parent.clock >= D(n, this.parent.client)) return this.parent.client;
		if (this.origin &&= (this.left = Bi(t, n, this.origin), this.left.lastId), this.rightOrigin &&= (this.right = zi(t, this.rightOrigin), this.right.id), this.left && this.left.constructor === So || this.right && this.right.constructor === So) this.parent = null;
		else if (!this.parent) this.left && this.left.constructor === e ? (this.parent = this.left.parent, this.parentSub = this.left.parentSub) : this.right && this.right.constructor === e && (this.parent = this.right.parent, this.parentSub = this.right.parentSub);
		else if (this.parent.constructor === gi) {
			let e = Li(n, this.parent);
			this.parent = e.constructor === So ? null : e.content.type;
		}
		return null;
	}
	integrate(e, t) {
		if (t > 0 && (this.id.clock += t, this.left = Bi(e, e.doc.store, E(this.id.client, this.id.clock - 1)), this.origin = this.left.lastId, this.content = this.content.splice(t), this.length -= t), this.parent) {
			if (!this.left && (!this.right || this.right.left !== null) || this.left && this.left.right !== this.right) {
				let t = this.left, n;
				if (t !== null) n = t.right;
				else if (this.parentSub !== null) for (n = this.parent._map.get(this.parentSub) || null; n !== null && n.left !== null;) n = n.left;
				else n = this.parent._start;
				let r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
				for (; n !== null && n !== this.right;) {
					if (i.add(n), r.add(n), _i(this.origin, n.origin)) {
						if (n.id.client < this.id.client) t = n, r.clear();
						else if (_i(this.rightOrigin, n.rightOrigin)) break;
					} else if (n.origin !== null && i.has(Li(e.doc.store, n.origin))) r.has(Li(e.doc.store, n.origin)) || (t = n, r.clear());
					else break;
					n = n.right;
				}
				this.left = t;
			}
			if (this.left !== null) {
				let e = this.left.right;
				this.right = e, this.left.right = this;
			} else {
				let e;
				if (this.parentSub !== null) for (e = this.parent._map.get(this.parentSub) || null; e !== null && e.left !== null;) e = e.left;
				else e = this.parent._start, this.parent._start = this;
				this.right = e;
			}
			this.right === null ? this.parentSub !== null && (this.parent._map.set(this.parentSub, this), this.left !== null && this.left.delete(e)) : this.right.left = this, this.parentSub === null && this.countable && !this.deleted && (this.parent._length += this.length), Fi(e.doc.store, this), this.content.integrate(e, this), Gi(e, this.parent, this.parentSub), (this.parent._item !== null && this.parent._item.deleted || this.parentSub !== null && this.right !== null) && this.delete(e);
		} else new So(this.id, this.length).integrate(e, 0);
	}
	get next() {
		let e = this.right;
		for (; e !== null && e.deleted;) e = e.right;
		return e;
	}
	get prev() {
		let e = this.left;
		for (; e !== null && e.deleted;) e = e.left;
		return e;
	}
	get lastId() {
		return this.length === 1 ? this.id : E(this.id.client, this.id.clock + this.length - 1);
	}
	mergeWith(e) {
		if (this.constructor === e.constructor && _i(e.origin, this.lastId) && this.right === e && _i(this.rightOrigin, e.rightOrigin) && this.id.client === e.id.client && this.id.clock + this.length === e.id.clock && this.deleted === e.deleted && this.redone === null && e.redone === null && this.content.constructor === e.content.constructor && this.content.mergeWith(e.content)) {
			let t = this.parent._searchMarker;
			return t && t.forEach((t) => {
				t.p === e && (t.p = this, !this.deleted && this.countable && (t.index -= this.length));
			}), e.keep && (this.keep = !0), this.right = e.right, this.right !== null && (this.right.left = this), this.length += e.length, !0;
		}
		return !1;
	}
	delete(e) {
		if (!this.deleted) {
			let t = this.parent;
			this.countable && this.parentSub === null && (t._length -= this.length), this.markDeleted(), Vr(e.deleteSet, this.id.client, this.id.clock, this.length), Gi(e, t, this.parentSub), this.content.delete(e);
		}
	}
	gc(e, t) {
		if (!this.deleted) throw S();
		this.content.gc(e), t ? Vi(e, this, new So(this.id, this.length)) : this.content = new To(this.length);
	}
	write(e, t) {
		let n = t > 0 ? E(this.id.client, this.id.clock + t - 1) : this.origin, r = this.rightOrigin, i = this.parentSub, a = this.content.getRef() & 31 | (n === null ? 0 : 128) | (r === null ? 0 : 64) | (i === null ? 0 : 32);
		if (e.writeInfo(a), n !== null && e.writeLeftID(n), r !== null && e.writeRightID(r), n === null && r === null) {
			let t = this.parent;
			if (t._item !== void 0) {
				let n = t._item;
				if (n === null) {
					let n = vi(t);
					e.writeParentInfo(!0), e.writeString(n);
				} else e.writeParentInfo(!1), e.writeLeftID(n.id);
			} else t.constructor === String ? (e.writeParentInfo(!0), e.writeString(t)) : t.constructor === gi ? (e.writeParentInfo(!1), e.writeLeftID(t)) : S();
			i !== null && e.writeString(i);
		}
		this.content.write(e, t);
	}
}, ns = (e, t) => rs[t & 31](e), rs = [
	() => {
		S();
	},
	Eo,
	Fo,
	wo,
	Bo,
	jo,
	No,
	Xo,
	Ro,
	ko,
	() => {
		S();
	}
], is = 10, as = class extends bo {
	get deleted() {
		return !0;
	}
	delete() {}
	mergeWith(e) {
		return this.constructor === e.constructor && (this.length += e.length, !0);
	}
	integrate(e, t) {
		S();
	}
	write(e, t) {
		e.writeInfo(is), x(e.restEncoder, this.length - t);
	}
	getMissing(e, t) {
		return null;
	}
}, ss = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : {}, cs = "__ $YJS$ __";
ss[cs] === !0 && console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438"), ss[cs] = !0;
// node_modules/@tiptap/core/dist/rolldown-runtime-D7D4PA-g.js
var ls = Object.defineProperty, us = (e, t) => {
	let n = {};
	for (var r in e) ls(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || ls(n, Symbol.toStringTag, { value: "Module" }), n;
};
// node_modules/orderedmap/dist/index.js
function ds(e) {
	this.content = e;
}
ds.prototype = {
	constructor: ds,
	find: function(e) {
		for (var t = 0; t < this.content.length; t += 2) if (this.content[t] === e) return t;
		return -1;
	},
	get: function(e) {
		var t = this.find(e);
		return t == -1 ? void 0 : this.content[t + 1];
	},
	update: function(e, t, n) {
		var r = n && n != e ? this.remove(n) : this, i = r.find(e), a = r.content.slice();
		return i == -1 ? a.push(n || e, t) : (a[i + 1] = t, n && (a[i] = n)), new ds(a);
	},
	remove: function(e) {
		var t = this.find(e);
		if (t == -1) return this;
		var n = this.content.slice();
		return n.splice(t, 2), new ds(n);
	},
	addToStart: function(e, t) {
		return new ds([e, t].concat(this.remove(e).content));
	},
	addToEnd: function(e, t) {
		var n = this.remove(e).content.slice();
		return n.push(e, t), new ds(n);
	},
	addBefore: function(e, t, n) {
		var r = this.remove(t), i = r.content.slice(), a = r.find(e);
		return i.splice(a == -1 ? i.length : a, 0, t, n), new ds(i);
	},
	forEach: function(e) {
		for (var t = 0; t < this.content.length; t += 2) e(this.content[t], this.content[t + 1]);
	},
	prepend: function(e) {
		return e = ds.from(e), e.size ? new ds(e.content.concat(this.subtract(e).content)) : this;
	},
	append: function(e) {
		return e = ds.from(e), e.size ? new ds(this.subtract(e).content.concat(e.content)) : this;
	},
	subtract: function(e) {
		var t = this;
		e = ds.from(e);
		for (var n = 0; n < e.content.length; n += 2) t = t.remove(e.content[n]);
		return t;
	},
	toObject: function() {
		var e = {};
		return this.forEach(function(t, n) {
			e[t] = n;
		}), e;
	},
	get size() {
		return this.content.length >> 1;
	}
}, ds.from = function(e) {
	if (e instanceof ds) return e;
	var t = [];
	if (e) for (var n in e) t.push(n, e[n]);
	return new ds(t);
};
// node_modules/prosemirror-model/dist/index.js
function fs(e, t, n) {
	for (let r = 0;; r++) {
		if (r == e.childCount || r == t.childCount) return e.childCount == t.childCount ? null : n;
		let i = e.child(r), a = t.child(r);
		if (i == a) n += i.nodeSize;
		else {
			if (!i.sameMarkup(a)) return n;
			if (i.isText && i.text != a.text) {
				let e = i.text, t = a.text, r = 0;
				for (; e[r] == t[r]; r++) n++;
				return r && r < e.length && r < t.length && hs(e.charCodeAt(r - 1)) && ms(e.charCodeAt(r)) && n--, n;
			}
			if (i.content.size || a.content.size) {
				let e = fs(i.content, a.content, n + 1);
				if (e != null) return e;
			}
			n += i.nodeSize;
		}
	}
}
function ps(e, t, n, r) {
	for (let i = e.childCount, a = t.childCount;;) {
		if (i == 0 || a == 0) return i == a ? null : {
			a: n,
			b: r
		};
		let o = e.child(--i), s = t.child(--a), c = o.nodeSize;
		if (o == s) n -= c, r -= c;
		else {
			if (!o.sameMarkup(s)) return {
				a: n,
				b: r
			};
			if (o.isText && o.text != s.text) {
				let e = o.text, t = s.text, i = e.length, a = t.length;
				for (; i > 0 && a > 0 && e[i - 1] == t[a - 1];) i--, a--, n--, r--;
				return i && a && i < e.length && hs(e.charCodeAt(i - 1)) && ms(e.charCodeAt(i)) && (n++, r++), {
					a: n,
					b: r
				};
			}
			if (o.content.size || s.content.size) {
				let e = ps(o.content, s.content, n - 1, r - 1);
				if (e) return e;
			}
			n -= c, r -= c;
		}
	}
}
function ms(e) {
	return e >= 56320 && e < 57344;
}
function hs(e) {
	return e >= 55296 && e < 56320;
}
var M = class e {
	constructor(e, t) {
		if (this.content = e, this.size = t || 0, t == null) for (let t = 0; t < e.length; t++) this.size += e[t].nodeSize;
	}
	nodesBetween(e, t, n, r = 0, i) {
		for (let a = 0, o = 0; o < t; a++) {
			let s = this.content[a], c = o + s.nodeSize;
			if (c > e && n(s, r + o, i || null, a) !== !1 && s.content.size) {
				let i = o + 1;
				s.nodesBetween(Math.max(0, e - i), Math.min(s.content.size, t - i), n, r + i);
			}
			o = c;
		}
	}
	descendants(e) {
		this.nodesBetween(0, this.size, e);
	}
	textBetween(e, t, n, r) {
		let i = "", a = !0;
		return this.nodesBetween(e, t, (o, s) => {
			let c = o.isText ? o.text.slice(Math.max(e, s) - s, t - s) : o.isLeaf ? r ? typeof r == "function" ? r(o) : r : o.type.spec.leafText ? o.type.spec.leafText(o) : "" : "";
			o.isBlock && (o.isLeaf && c || o.isTextblock) && n && (a ? a = !1 : i += n), i += c;
		}, 0), i;
	}
	append(t) {
		if (!t.size) return this;
		if (!this.size) return t;
		let n = this.lastChild, r = t.firstChild, i = this.content.slice(), a = 0;
		for (n.isText && n.sameMarkup(r) && (i[i.length - 1] = n.withText(n.text + r.text), a = 1); a < t.content.length; a++) i.push(t.content[a]);
		return new e(i, this.size + t.size);
	}
	cut(t, n = this.size) {
		if (t == 0 && n == this.size) return this;
		let r = [], i = 0;
		if (n > t) for (let e = 0, a = 0; a < n; e++) {
			let o = this.content[e], s = a + o.nodeSize;
			s > t && ((a < t || s > n) && (o = o.isText ? o.cut(Math.max(0, t - a), Math.min(o.text.length, n - a)) : o.cut(Math.max(0, t - a - 1), Math.min(o.content.size, n - a - 1))), r.push(o), i += o.nodeSize), a = s;
		}
		return new e(r, i);
	}
	cutByIndex(t, n) {
		return t == n ? e.empty : t == 0 && n == this.content.length ? this : new e(this.content.slice(t, n));
	}
	replaceChild(t, n) {
		let r = this.content[t];
		if (r == n) return this;
		let i = this.content.slice(), a = this.size + n.nodeSize - r.nodeSize;
		return i[t] = n, new e(i, a);
	}
	addToStart(t) {
		return new e([t].concat(this.content), this.size + t.nodeSize);
	}
	addToEnd(t) {
		return new e(this.content.concat(t), this.size + t.nodeSize);
	}
	eq(e) {
		if (this.content.length != e.content.length) return !1;
		for (let t = 0; t < this.content.length; t++) if (!this.content[t].eq(e.content[t])) return !1;
		return !0;
	}
	get firstChild() {
		return this.content.length ? this.content[0] : null;
	}
	get lastChild() {
		return this.content.length ? this.content[this.content.length - 1] : null;
	}
	get childCount() {
		return this.content.length;
	}
	child(e) {
		let t = this.content[e];
		if (!t) throw RangeError("Index " + e + " out of range for " + this);
		return t;
	}
	maybeChild(e) {
		return this.content[e] || null;
	}
	forEach(e) {
		for (let t = 0, n = 0; t < this.content.length; t++) {
			let r = this.content[t];
			e(r, n, t), n += r.nodeSize;
		}
	}
	findDiffStart(e, t = 0) {
		return fs(this, e, t);
	}
	findDiffEnd(e, t = this.size, n = e.size) {
		return ps(this, e, t, n);
	}
	findIndex(e) {
		if (e == 0) return _s(0, e);
		if (e == this.size) return _s(this.content.length, e);
		if (e > this.size || e < 0) throw RangeError(`Position ${e} outside of fragment (${this})`);
		for (let t = 0, n = 0;; t++) {
			let r = this.child(t), i = n + r.nodeSize;
			if (i >= e) return i == e ? _s(t + 1, i) : _s(t, n);
			n = i;
		}
	}
	toString() {
		return "<" + this.toStringInner() + ">";
	}
	toStringInner() {
		return this.content.join(", ");
	}
	toJSON() {
		return this.content.length ? this.content.map((e) => e.toJSON()) : null;
	}
	static fromJSON(t, n) {
		if (!n) return e.empty;
		if (!Array.isArray(n)) throw RangeError("Invalid input for Fragment.fromJSON");
		return e.fromArray(n.map(t.nodeFromJSON));
	}
	static fromArray(t) {
		if (!t.length) return e.empty;
		let n, r = 0;
		for (let e = 0; e < t.length; e++) {
			let i = t[e];
			r += i.nodeSize, e && i.isText && t[e - 1].sameMarkup(i) ? (n ||= t.slice(0, e), n[n.length - 1] = i.withText(n[n.length - 1].text + i.text)) : n && n.push(i);
		}
		return new e(n || t, r);
	}
	static from(t) {
		if (!t) return e.empty;
		if (t instanceof e) return t;
		if (Array.isArray(t)) return this.fromArray(t);
		if (t.attrs) return new e([t], t.nodeSize);
		throw RangeError("Can not convert " + t + " to a Fragment" + (t.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
	}
};
M.empty = new M([], 0);
var gs = {
	index: 0,
	offset: 0
};
function _s(e, t) {
	return gs.index = e, gs.offset = t, gs;
}
function vs(e, t) {
	if (e === t) return !0;
	if (!(e && typeof e == "object") || !(t && typeof t == "object")) return !1;
	let n = Array.isArray(e);
	if (Array.isArray(t) != n) return !1;
	if (n) {
		if (e.length != t.length) return !1;
		for (let n = 0; n < e.length; n++) if (!vs(e[n], t[n])) return !1;
	} else {
		for (let n in e) if (!(n in t) || !vs(e[n], t[n])) return !1;
		for (let n in t) if (!(n in e)) return !1;
	}
	return !0;
}
var N = class e {
	constructor(e, t) {
		this.type = e, this.attrs = t;
	}
	addToSet(e) {
		let t, n = !1;
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (this.eq(i)) return e;
			if (this.type.excludes(i.type)) t ||= e.slice(0, r);
			else if (i.type.excludes(this.type)) return e;
			else !n && i.type.rank > this.type.rank && (t ||= e.slice(0, r), t.push(this), n = !0), t && t.push(i);
		}
		return t ||= e.slice(), n || t.push(this), t;
	}
	removeFromSet(e) {
		for (let t = 0; t < e.length; t++) if (this.eq(e[t])) return e.slice(0, t).concat(e.slice(t + 1));
		return e;
	}
	isInSet(e) {
		for (let t = 0; t < e.length; t++) if (this.eq(e[t])) return !0;
		return !1;
	}
	eq(e) {
		return this == e || this.type == e.type && vs(this.attrs, e.attrs);
	}
	toJSON() {
		let e = { type: this.type.name };
		for (let t in this.attrs) {
			e.attrs = this.attrs;
			break;
		}
		return e;
	}
	static fromJSON(e, t) {
		if (!t) throw RangeError("Invalid input for Mark.fromJSON");
		let n = e.marks[t.type];
		if (!n) throw RangeError(`There is no mark type ${t.type} in this schema`);
		return n.create(t.attrs);
	}
	static sameSet(e, t) {
		if (e == t) return !0;
		if (e.length != t.length) return !1;
		for (let n = 0; n < e.length; n++) if (!e[n].eq(t[n])) return !1;
		return !0;
	}
	static setFrom(t) {
		if (!t || Array.isArray(t) && t.length == 0) return e.none;
		if (t instanceof e) return [t];
		let n = t.slice();
		return n.sort((e, t) => e.type.rank - t.type.rank), n;
	}
};
N.none = [];
var ys = class extends Error {}, P = class e {
	constructor(e, t, n) {
		this.content = e, this.openStart = t, this.openEnd = n;
	}
	get size() {
		return this.content.size - this.openStart - this.openEnd;
	}
	insertAt(t, n) {
		let r = xs(this.content, t + this.openStart, n, this.openStart + 1, this.openEnd + 1);
		return r && new e(r, this.openStart, this.openEnd);
	}
	removeBetween(t, n) {
		return new e(bs(this.content, t + this.openStart, n + this.openStart), this.openStart, this.openEnd);
	}
	eq(e) {
		return this.content.eq(e.content) && this.openStart == e.openStart && this.openEnd == e.openEnd;
	}
	toString() {
		return this.content + "(" + this.openStart + "," + this.openEnd + ")";
	}
	toJSON() {
		if (!this.content.size) return null;
		let e = { content: this.content.toJSON() };
		return this.openStart > 0 && (e.openStart = this.openStart), this.openEnd > 0 && (e.openEnd = this.openEnd), e;
	}
	static fromJSON(t, n) {
		if (!n) return e.empty;
		let r = n.openStart || 0, i = n.openEnd || 0;
		if (typeof r != "number" || typeof i != "number") throw RangeError("Invalid input for Slice.fromJSON");
		return new e(M.fromJSON(t, n.content), r, i);
	}
	static maxOpen(t, n = !0) {
		let r = 0, i = 0;
		for (let e = t.firstChild; e && !e.isLeaf && (n || !e.type.spec.isolating); e = e.firstChild) r++;
		for (let e = t.lastChild; e && !e.isLeaf && (n || !e.type.spec.isolating); e = e.lastChild) i++;
		return new e(t, r, i);
	}
};
P.empty = new P(M.empty, 0, 0);
function bs(e, t, n) {
	let { index: r, offset: i } = e.findIndex(t), a = e.maybeChild(r), { index: o, offset: s } = e.findIndex(n);
	if (i == t || a.isText) {
		if (s != n && !e.child(o).isText) throw RangeError("Removing non-flat range");
		return e.cut(0, t).append(e.cut(n));
	}
	if (r != o) throw RangeError("Removing non-flat range");
	return e.replaceChild(r, a.copy(bs(a.content, t - i - 1, n - i - 1)));
}
function xs(e, t, n, r, i, a) {
	let { index: o, offset: s } = e.findIndex(t), c = e.maybeChild(o);
	if (s == t || c.isText) return a && r <= 0 && i <= 0 && !a.canReplace(o, o, n) ? null : e.cut(0, t).append(n).append(e.cut(t));
	let l = xs(c.content, t - s - 1, n, o == 0 ? r - 1 : 0, o == e.childCount - 1 ? i - 1 : 0, c);
	return l && e.replaceChild(o, c.copy(l));
}
function Ss(e, t, n) {
	if (n.openStart > e.depth) throw new ys("Inserted content deeper than insertion position");
	if (e.depth - n.openStart != t.depth - n.openEnd) throw new ys("Inconsistent open depths");
	return Cs(e, t, n, 0);
}
function Cs(e, t, n, r) {
	let i = e.index(r), a = e.node(r);
	if (i == t.index(r) && r < e.depth - n.openStart) {
		let o = Cs(e, t, n, r + 1);
		return a.copy(a.content.replaceChild(i, o));
	}
	if (!n.content.size) return Os(a, As(e, t, r));
	if (!n.openStart && !n.openEnd && e.depth == r && t.depth == r) {
		let r = e.parent, i = r.content;
		return Os(r, i.cut(0, e.parentOffset).append(n.content).append(i.cut(t.parentOffset)));
	}
	{
		let { start: i, end: o } = js(n, e);
		return Os(a, ks(e, i, o, t, r));
	}
}
function ws(e, t) {
	if (!t.type.compatibleContent(e.type)) throw new ys("Cannot join " + t.type.name + " onto " + e.type.name);
}
function Ts(e, t, n) {
	let r = e.node(n);
	return ws(r, t.node(n)), r;
}
function Es(e, t) {
	let n = t.length - 1;
	n >= 0 && e.isText && e.sameMarkup(t[n]) ? t[n] = e.withText(t[n].text + e.text) : t.push(e);
}
function Ds(e, t, n, r) {
	let i = (t || e).node(n), a = 0, o = t ? t.index(n) : i.childCount;
	e && (a = e.index(n), e.depth > n ? a++ : e.textOffset && (Es(e.nodeAfter, r), a++));
	for (let e = a; e < o; e++) Es(i.child(e), r);
	t && t.depth == n && t.textOffset && Es(t.nodeBefore, r);
}
function Os(e, t) {
	if (!e.type.validContent(t)) throw new ys("Invalid content for node " + e.type.name);
	return e.copy(t);
}
function ks(e, t, n, r, i) {
	let a = e.depth > i && Ts(e, t, i + 1), o = r.depth > i && Ts(n, r, i + 1), s = [];
	return Ds(null, e, i, s), a && o && t.index(i) == n.index(i) ? (ws(a, o), Es(Os(a, ks(e, t, n, r, i + 1)), s)) : (a && Es(Os(a, As(e, t, i + 1)), s), Ds(t, n, i, s), o && Es(Os(o, As(n, r, i + 1)), s)), Ds(r, null, i, s), new M(s);
}
function As(e, t, n) {
	let r = [];
	return Ds(null, e, n, r), e.depth > n && Es(Os(Ts(e, t, n + 1), As(e, t, n + 1)), r), Ds(t, null, n, r), new M(r);
}
function js(e, t) {
	let n = t.depth - e.openStart, r = t.node(n).copy(e.content);
	for (let e = n - 1; e >= 0; e--) r = t.node(e).copy(M.from(r));
	return {
		start: r.resolveNoCache(e.openStart + n),
		end: r.resolveNoCache(r.content.size - e.openEnd - n)
	};
}
var Ms = class e {
	constructor(e, t, n) {
		this.pos = e, this.path = t, this.parentOffset = n, this.depth = t.length / 3 - 1;
	}
	resolveDepth(e) {
		return e == null ? this.depth : e < 0 ? this.depth + e : e;
	}
	get parent() {
		return this.node(this.depth);
	}
	get doc() {
		return this.node(0);
	}
	node(e) {
		return this.path[this.resolveDepth(e) * 3];
	}
	index(e) {
		return this.path[this.resolveDepth(e) * 3 + 1];
	}
	indexAfter(e) {
		return e = this.resolveDepth(e), this.index(e) + (e == this.depth && !this.textOffset ? 0 : 1);
	}
	start(e) {
		return e = this.resolveDepth(e), e == 0 ? 0 : this.path[e * 3 - 1] + 1;
	}
	end(e) {
		return e = this.resolveDepth(e), this.start(e) + this.node(e).content.size;
	}
	before(e) {
		if (e = this.resolveDepth(e), !e) throw RangeError("There is no position before the top-level node");
		return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1];
	}
	after(e) {
		if (e = this.resolveDepth(e), !e) throw RangeError("There is no position after the top-level node");
		return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1] + this.path[e * 3].nodeSize;
	}
	get textOffset() {
		return this.pos - this.path[this.path.length - 1];
	}
	get nodeAfter() {
		let e = this.parent, t = this.index(this.depth);
		if (t == e.childCount) return null;
		let n = this.pos - this.path[this.path.length - 1], r = e.child(t);
		return n ? e.child(t).cut(n) : r;
	}
	get nodeBefore() {
		let e = this.index(this.depth), t = this.pos - this.path[this.path.length - 1];
		return t ? this.parent.child(e).cut(0, t) : e == 0 ? null : this.parent.child(e - 1);
	}
	posAtIndex(e, t) {
		t = this.resolveDepth(t);
		let n = this.path[t * 3], r = t == 0 ? 0 : this.path[t * 3 - 1] + 1;
		for (let t = 0; t < e; t++) r += n.child(t).nodeSize;
		return r;
	}
	marks() {
		let e = this.parent, t = this.index();
		if (e.content.size == 0) return N.none;
		if (this.textOffset) return e.child(t).marks;
		let n = e.maybeChild(t - 1), r = e.maybeChild(t);
		if (!n) {
			let e = n;
			n = r, r = e;
		}
		let i = n.marks;
		for (var a = 0; a < i.length; a++) i[a].type.spec.inclusive !== !1 || r && i[a].isInSet(r.marks) || (i = i[a--].removeFromSet(i));
		return i;
	}
	marksAcross(e) {
		let t = this.parent.maybeChild(this.index());
		if (!t || !t.isInline) return null;
		let n = t.marks, r = e.parent.maybeChild(e.index());
		for (var i = 0; i < n.length; i++) n[i].type.spec.inclusive !== !1 || r && n[i].isInSet(r.marks) || (n = n[i--].removeFromSet(n));
		return n;
	}
	sharedDepth(e) {
		for (let t = this.depth; t > 0; t--) if (this.start(t) <= e && this.end(t) >= e) return t;
		return 0;
	}
	blockRange(e = this, t) {
		if (e.pos < this.pos) return e.blockRange(this);
		for (let n = this.depth - (this.parent.inlineContent || this.pos == e.pos ? 1 : 0); n >= 0; n--) if (e.pos <= this.end(n) && (!t || t(this.node(n)))) return new Is(this, e, n);
		return null;
	}
	sameParent(e) {
		return this.pos - this.parentOffset == e.pos - e.parentOffset;
	}
	max(e) {
		return e.pos > this.pos ? e : this;
	}
	min(e) {
		return e.pos < this.pos ? e : this;
	}
	toString() {
		let e = "";
		for (let t = 1; t <= this.depth; t++) e += (e ? "/" : "") + this.node(t).type.name + "_" + this.index(t - 1);
		return e + ":" + this.parentOffset;
	}
	static resolve(t, n) {
		if (!(n >= 0 && n <= t.content.size)) throw RangeError("Position " + n + " out of range");
		let r = [], i = 0, a = n;
		for (let e = t;;) {
			let { index: t, offset: n } = e.content.findIndex(a), o = a - n;
			if (r.push(e, t, i + n), !o || (e = e.child(t), e.isText)) break;
			a = o - 1, i += n + 1;
		}
		return new e(n, r, a);
	}
	static resolveCached(t, n) {
		let r = Fs.get(t);
		if (r) for (let e = 0; e < r.elts.length; e++) {
			let t = r.elts[e];
			if (t.pos == n) return t;
		}
		else Fs.set(t, r = new Ns());
		let i = r.elts[r.i] = e.resolve(t, n);
		return r.i = (r.i + 1) % Ps, i;
	}
}, Ns = class {
	constructor() {
		this.elts = [], this.i = 0;
	}
}, Ps = 12, Fs = /* @__PURE__ */ new WeakMap(), Is = class {
	constructor(e, t, n) {
		this.$from = e, this.$to = t, this.depth = n;
	}
	get start() {
		return this.$from.before(this.depth + 1);
	}
	get end() {
		return this.$to.after(this.depth + 1);
	}
	get parent() {
		return this.$from.node(this.depth);
	}
	get startIndex() {
		return this.$from.index(this.depth);
	}
	get endIndex() {
		return this.$to.indexAfter(this.depth);
	}
}, Ls = Object.create(null), Rs = class e {
	constructor(e, t, n, r = N.none) {
		this.type = e, this.attrs = t, this.marks = r, this.content = n || M.empty;
	}
	get children() {
		return this.content.content;
	}
	get nodeSize() {
		return this.isLeaf ? 1 : 2 + this.content.size;
	}
	get childCount() {
		return this.content.childCount;
	}
	child(e) {
		return this.content.child(e);
	}
	maybeChild(e) {
		return this.content.maybeChild(e);
	}
	forEach(e) {
		this.content.forEach(e);
	}
	nodesBetween(e, t, n, r = 0) {
		this.content.nodesBetween(e, t, n, r, this);
	}
	descendants(e) {
		this.nodesBetween(0, this.content.size, e);
	}
	get textContent() {
		return this.isLeaf && this.type.spec.leafText ? this.type.spec.leafText(this) : this.textBetween(0, this.content.size, "");
	}
	textBetween(e, t, n, r) {
		return this.content.textBetween(e, t, n, r);
	}
	get firstChild() {
		return this.content.firstChild;
	}
	get lastChild() {
		return this.content.lastChild;
	}
	eq(e) {
		return this == e || this.sameMarkup(e) && this.content.eq(e.content);
	}
	sameMarkup(e) {
		return this.hasMarkup(e.type, e.attrs, e.marks);
	}
	hasMarkup(e, t, n) {
		return this.type == e && vs(this.attrs, t || e.defaultAttrs || Ls) && N.sameSet(this.marks, n || N.none);
	}
	copy(t = null) {
		return t == this.content ? this : new e(this.type, this.attrs, t, this.marks);
	}
	mark(t) {
		return t == this.marks ? this : new e(this.type, this.attrs, this.content, t);
	}
	cut(e, t = this.content.size) {
		return e == 0 && t == this.content.size ? this : this.copy(this.content.cut(e, t));
	}
	slice(e, t = this.content.size, n = !1) {
		if (e == t) return P.empty;
		let r = this.resolve(e), i = this.resolve(t), a = n ? 0 : r.sharedDepth(t), o = r.start(a);
		return new P(r.node(a).content.cut(r.pos - o, i.pos - o), r.depth - a, i.depth - a);
	}
	replace(e, t, n) {
		return Ss(this.resolve(e), this.resolve(t), n);
	}
	nodeAt(e) {
		for (let t = this;;) {
			let { index: n, offset: r } = t.content.findIndex(e);
			if (t = t.maybeChild(n), !t) return null;
			if (r == e || t.isText) return t;
			e -= r + 1;
		}
	}
	childAfter(e) {
		let { index: t, offset: n } = this.content.findIndex(e);
		return {
			node: this.content.maybeChild(t),
			index: t,
			offset: n
		};
	}
	childBefore(e) {
		if (e == 0) return {
			node: null,
			index: 0,
			offset: 0
		};
		let { index: t, offset: n } = this.content.findIndex(e);
		if (n < e) return {
			node: this.content.child(t),
			index: t,
			offset: n
		};
		let r = this.content.child(t - 1);
		return {
			node: r,
			index: t - 1,
			offset: n - r.nodeSize
		};
	}
	resolve(e) {
		return Ms.resolveCached(this, e);
	}
	resolveNoCache(e) {
		return Ms.resolve(this, e);
	}
	rangeHasMark(e, t, n) {
		let r = !1;
		return t > e && this.nodesBetween(e, t, (e) => (n.isInSet(e.marks) && (r = !0), !r)), r;
	}
	get isBlock() {
		return this.type.isBlock;
	}
	get isTextblock() {
		return this.type.isTextblock;
	}
	get inlineContent() {
		return this.type.inlineContent;
	}
	get isInline() {
		return this.type.isInline;
	}
	get isText() {
		return this.type.isText;
	}
	get isLeaf() {
		return this.type.isLeaf;
	}
	get isAtom() {
		return this.type.isAtom;
	}
	toString() {
		if (this.type.spec.toDebugString) return this.type.spec.toDebugString(this);
		let e = this.type.name;
		return this.content.size && (e += "(" + this.content.toStringInner() + ")"), Vs(this.marks, e);
	}
	contentMatchAt(e) {
		let t = this.type.contentMatch.matchFragment(this.content, 0, e);
		if (!t) throw Error("Called contentMatchAt on a node with invalid content");
		return t;
	}
	canReplace(e, t, n = M.empty, r = 0, i = n.childCount) {
		let a = this.contentMatchAt(e).matchFragment(n, r, i), o = a && a.matchFragment(this.content, t);
		if (!o || !o.validEnd) return !1;
		for (let e = r; e < i; e++) if (!this.type.allowsMarks(n.child(e).marks)) return !1;
		return !0;
	}
	canReplaceWith(e, t, n, r) {
		if (r && !this.type.allowsMarks(r)) return !1;
		let i = this.contentMatchAt(e).matchType(n), a = i && i.matchFragment(this.content, t);
		return a ? a.validEnd : !1;
	}
	canAppend(e) {
		return e.content.size ? this.canReplace(this.childCount, this.childCount, e.content) : this.type.compatibleContent(e.type);
	}
	check() {
		this.type.checkContent(this.content), Hs(this.type.attrs, this.attrs, "node", this.type.name);
		let e = N.none;
		for (let t = 0; t < this.marks.length; t++) {
			let n = this.marks[t];
			Hs(n.type.attrs, n.attrs, "mark", n.type.name), e = n.addToSet(e);
		}
		if (!N.sameSet(e, this.marks)) throw RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map((e) => e.type.name)}`);
		this.content.forEach((e) => e.check());
	}
	toJSON() {
		let e = { type: this.type.name };
		for (let t in this.attrs) {
			e.attrs = this.attrs;
			break;
		}
		return this.content.size && (e.content = this.content.toJSON()), this.marks.length && (e.marks = this.marks.map((e) => e.toJSON())), e;
	}
	static fromJSON(e, t) {
		if (!t) throw RangeError("Invalid input for Node.fromJSON");
		let n;
		if (t.marks) {
			if (!Array.isArray(t.marks)) throw RangeError("Invalid mark data for Node.fromJSON");
			n = t.marks.map(e.markFromJSON);
		}
		if (t.type == "text") {
			if (typeof t.text != "string") throw RangeError("Invalid text node in JSON");
			return e.text(t.text, n);
		}
		let r = M.fromJSON(e, t.content);
		return e.nodeType(t.type).create(t.attrs, r, n);
	}
};
Rs.prototype.text = void 0;
var zs = (() => {
	let { stack: e } = /* @__PURE__ */ Error("/");
	if (!e || !/\n\s*at\s/.test(e)) return (e) => e;
	let t = Object.create(null);
	return (e) => (t[e], e);
})(), Bs = class e extends Rs {
	constructor(e, t, n, r) {
		if (super(e, t, null, r), !n) throw RangeError("Empty text nodes are not allowed");
		this.text = n;
	}
	toString() {
		return this.type.spec.toDebugString ? this.type.spec.toDebugString(this) : Vs(this.marks, JSON.stringify(this.text));
	}
	get textContent() {
		return this.text;
	}
	textBetween(e, t) {
		return zs(this.text.slice(e, t));
	}
	get nodeSize() {
		return this.text.length;
	}
	mark(t) {
		return t == this.marks ? this : new e(this.type, this.attrs, this.text, t);
	}
	withText(t) {
		return t == this.text ? this : new e(this.type, this.attrs, t, this.marks);
	}
	cut(e = 0, t = this.text.length) {
		return e == 0 && t == this.text.length ? this : this.withText(zs(this.text.slice(e, t)));
	}
	eq(e) {
		return this.sameMarkup(e) && this.text == e.text;
	}
	toJSON() {
		let e = super.toJSON();
		return e.text = this.text, e;
	}
};
function Vs(e, t) {
	for (let n = e.length - 1; n >= 0; n--) t = e[n].type.name + "(" + t + ")";
	return t;
}
function Hs(e, t, n, r) {
	for (let i in t) if (!(i in e)) throw RangeError(`Unsupported attribute ${i} for ${n} of type ${r}`);
	for (let n in e) e[n].validate && e[n].validate(t[n]);
}
var Us = class e {
	constructor(e) {
		this.validEnd = e, this.next = [], this.wrapCache = [];
	}
	static parse(t, n) {
		let r = new Ws(t, n);
		if (r.next == null) return e.empty;
		let i = Gs(r);
		r.next && r.err("Unexpected trailing text");
		let a = tc(Qs(i));
		return nc(a, r), a;
	}
	matchType(e) {
		for (let t = 0; t < this.next.length; t++) if (this.next[t].type == e) return this.next[t].next;
		return null;
	}
	matchFragment(e, t = 0, n = e.childCount) {
		let r = this;
		for (let i = t; r && i < n; i++) r = r.matchType(e.child(i).type);
		return r;
	}
	get inlineContent() {
		return this.next.length != 0 && this.next[0].type.isInline;
	}
	get defaultType() {
		for (let e = 0; e < this.next.length; e++) {
			let { type: t } = this.next[e];
			if (!(t.isText || t.hasRequiredAttrs())) return t;
		}
		return null;
	}
	compatible(e) {
		for (let t = 0; t < this.next.length; t++) for (let n = 0; n < e.next.length; n++) if (this.next[t].type == e.next[n].type) return !0;
		return !1;
	}
	fillBefore(e, t = !1, n = 0) {
		let r = [this];
		function i(a, o) {
			let s = a.matchFragment(e, n);
			if (s && (!t || s.validEnd)) return M.from(o.map((e) => e.createAndFill()));
			for (let e = 0; e < a.next.length; e++) {
				let { type: t, next: n } = a.next[e];
				if (!(t.isText || t.hasRequiredAttrs()) && r.indexOf(n) == -1) {
					r.push(n);
					let e = i(n, o.concat(t));
					if (e) return e;
				}
			}
			return null;
		}
		return i(this, []);
	}
	findWrapping(e) {
		for (let t = 0; t < this.wrapCache.length; t += 2) if (this.wrapCache[t] == e) return this.wrapCache[t + 1];
		let t = this.computeWrapping(e);
		return this.wrapCache.push(e, t), t;
	}
	computeWrapping(e) {
		let t = Object.create(null), n = [{
			match: this,
			type: null,
			via: null
		}];
		for (; n.length;) {
			let r = n.shift(), i = r.match;
			if (i.matchType(e)) {
				let e = [];
				for (let t = r; t.type; t = t.via) e.push(t.type);
				return e.reverse();
			}
			for (let e = 0; e < i.next.length; e++) {
				let { type: a, next: o } = i.next[e];
				a.isLeaf || a.hasRequiredAttrs() || a.name in t || r.type && !o.validEnd || (n.push({
					match: a.contentMatch,
					type: a,
					via: r
				}), t[a.name] = !0);
			}
		}
		return null;
	}
	get edgeCount() {
		return this.next.length;
	}
	edge(e) {
		if (e >= this.next.length) throw RangeError(`There's no ${e}th edge in this content match`);
		return this.next[e];
	}
	toString() {
		let e = [];
		function t(n) {
			e.push(n);
			for (let r = 0; r < n.next.length; r++) e.indexOf(n.next[r].next) == -1 && t(n.next[r].next);
		}
		return t(this), e.map((t, n) => {
			let r = n + (t.validEnd ? "*" : " ") + " ";
			for (let n = 0; n < t.next.length; n++) r += (n ? ", " : "") + t.next[n].type.name + "->" + e.indexOf(t.next[n].next);
			return r;
		}).join("\n");
	}
};
Us.empty = new Us(!0);
var Ws = class {
	constructor(e, t) {
		this.string = e, this.nodeTypes = t, this.inline = null, this.pos = 0, this.tokens = e.split(/\s*(?=\b|\W|$)/), this.tokens[this.tokens.length - 1] == "" && this.tokens.pop(), this.tokens[0] == "" && this.tokens.shift();
	}
	get next() {
		return this.tokens[this.pos];
	}
	eat(e) {
		return this.next == e && (this.pos++ || !0);
	}
	err(e) {
		throw SyntaxError(e + " (in content expression '" + this.string + "')");
	}
};
function Gs(e) {
	let t = [];
	do
		t.push(Ks(e));
	while (e.eat("|"));
	return t.length == 1 ? t[0] : {
		type: "choice",
		exprs: t
	};
}
function Ks(e) {
	let t = [];
	do
		t.push(qs(e));
	while (e.next && e.next != ")" && e.next != "|");
	return t.length == 1 ? t[0] : {
		type: "seq",
		exprs: t
	};
}
function qs(e) {
	let t = Zs(e);
	for (;;) if (e.eat("+")) t = {
		type: "plus",
		expr: t
	};
	else if (e.eat("*")) t = {
		type: "star",
		expr: t
	};
	else if (e.eat("?")) t = {
		type: "opt",
		expr: t
	};
	else if (e.eat("{")) t = Ys(e, t);
	else break;
	return t;
}
function Js(e) {
	/\D/.test(e.next) && e.err("Expected number, got '" + e.next + "'");
	let t = Number(e.next);
	return e.pos++, t;
}
function Ys(e, t) {
	let n = Js(e), r = n;
	return e.eat(",") && (r = e.next == "}" ? -1 : Js(e)), e.eat("}") || e.err("Unclosed braced range"), {
		type: "range",
		min: n,
		max: r,
		expr: t
	};
}
function Xs(e, t) {
	let n = e.nodeTypes, r = n[t];
	if (r) return [r];
	let i = [];
	for (let e in n) {
		let r = n[e];
		r.isInGroup(t) && i.push(r);
	}
	return i.length == 0 && e.err("No node type or group '" + t + "' found"), i;
}
function Zs(e) {
	if (e.eat("(")) {
		let t = Gs(e);
		return e.eat(")") || e.err("Missing closing paren"), t;
	}
	if (/\W/.test(e.next)) e.err("Unexpected token '" + e.next + "'");
	else {
		let t = Xs(e, e.next).map((t) => (e.inline == null ? e.inline = t.isInline : e.inline != t.isInline && e.err("Mixing inline and block content"), {
			type: "name",
			value: t
		}));
		return e.pos++, t.length == 1 ? t[0] : {
			type: "choice",
			exprs: t
		};
	}
}
function Qs(e) {
	let t = [[]];
	return i(a(e, 0), n()), t;
	function n() {
		return t.push([]) - 1;
	}
	function r(e, n, r) {
		let i = {
			term: r,
			to: n
		};
		return t[e].push(i), i;
	}
	function i(e, t) {
		e.forEach((e) => e.to = t);
	}
	function a(e, t) {
		if (e.type == "choice") return e.exprs.reduce((e, n) => e.concat(a(n, t)), []);
		if (e.type == "seq") for (let r = 0;; r++) {
			let o = a(e.exprs[r], t);
			if (r == e.exprs.length - 1) return o;
			i(o, t = n());
		}
		else if (e.type == "star") {
			let o = n();
			return r(t, o), i(a(e.expr, o), o), [r(o)];
		} else if (e.type == "plus") {
			let o = n();
			return i(a(e.expr, t), o), i(a(e.expr, o), o), [r(o)];
		} else if (e.type == "opt") return [r(t)].concat(a(e.expr, t));
		else if (e.type == "range") {
			let o = t;
			for (let t = 0; t < e.min; t++) {
				let t = n();
				i(a(e.expr, o), t), o = t;
			}
			if (e.max == -1) i(a(e.expr, o), o);
			else for (let t = e.min; t < e.max; t++) {
				let t = n();
				r(o, t), i(a(e.expr, o), t), o = t;
			}
			return [r(o)];
		} else if (e.type == "name") return [r(t, void 0, e.value)];
		else throw Error("Unknown expr type");
	}
}
function $s(e, t) {
	return t - e;
}
function ec(e, t) {
	let n = [];
	return r(t), n.sort($s);
	function r(t) {
		let i = e[t];
		if (i.length == 1 && !i[0].term) return r(i[0].to);
		n.push(t);
		for (let e = 0; e < i.length; e++) {
			let { term: t, to: a } = i[e];
			!t && n.indexOf(a) == -1 && r(a);
		}
	}
}
function tc(e) {
	let t = Object.create(null);
	return n(ec(e, 0));
	function n(r) {
		let i = [];
		r.forEach((t) => {
			e[t].forEach(({ term: t, to: n }) => {
				if (!t) return;
				let r;
				for (let e = 0; e < i.length; e++) i[e][0] == t && (r = i[e][1]);
				ec(e, n).forEach((e) => {
					r || i.push([t, r = []]), r.indexOf(e) == -1 && r.push(e);
				});
			});
		});
		let a = t[r.join(",")] = new Us(r.indexOf(e.length - 1) > -1);
		for (let e = 0; e < i.length; e++) {
			let r = i[e][1].sort($s);
			a.next.push({
				type: i[e][0],
				next: t[r.join(",")] || n(r)
			});
		}
		return a;
	}
}
function nc(e, t) {
	for (let n = 0, r = [e]; n < r.length; n++) {
		let e = r[n], i = !e.validEnd, a = [];
		for (let t = 0; t < e.next.length; t++) {
			let { type: n, next: o } = e.next[t];
			a.push(n.name), i && !(n.isText || n.hasRequiredAttrs()) && (i = !1), r.indexOf(o) == -1 && r.push(o);
		}
		i && t.err("Only non-generatable nodes (" + a.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
	}
}
function rc(e) {
	let t = Object.create(null);
	for (let n in e) {
		let r = e[n];
		if (!r.hasDefault) return null;
		t[n] = r.default;
	}
	return t;
}
function ic(e, t) {
	let n = Object.create(null);
	for (let r in e) {
		let i = e[r], a = t && t[r];
		if (a === void 0) {
			if (i.hasDefault) a = i.default;
			else throw RangeError("No value supplied for attribute " + r);
		} else i.validate && i.validate(a);
		n[r] = a;
	}
	return n;
}
function ac(e, t) {
	let n = Object.create(null);
	if (t) for (let r in t) n[r] = new cc(e, r, t[r]);
	return n;
}
var oc = class e {
	constructor(e, t, n) {
		this.name = e, this.schema = t, this.spec = n, this.markSet = null, this.groups = n.group ? n.group.split(" ") : [], this.attrs = ac(e, n.attrs), this.defaultAttrs = rc(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(n.inline || e == "text"), this.isText = e == "text";
	}
	get isInline() {
		return !this.isBlock;
	}
	get isTextblock() {
		return this.isBlock && this.inlineContent;
	}
	get isLeaf() {
		return this.contentMatch == Us.empty;
	}
	get isAtom() {
		return this.isLeaf || !!this.spec.atom;
	}
	isInGroup(e) {
		return this.groups.indexOf(e) > -1;
	}
	get whitespace() {
		return this.spec.whitespace || (this.spec.code ? "pre" : "normal");
	}
	hasRequiredAttrs() {
		for (let e in this.attrs) if (this.attrs[e].isRequired) return !0;
		return !1;
	}
	compatibleContent(e) {
		return this == e || this.contentMatch.compatible(e.contentMatch);
	}
	computeAttrs(e) {
		return !e && this.defaultAttrs ? this.defaultAttrs : ic(this.attrs, e);
	}
	create(e = null, t, n) {
		if (this.isText) throw Error("NodeType.create can't construct text nodes");
		return new Rs(this, this.computeAttrs(e), M.from(t), N.setFrom(n));
	}
	createChecked(e = null, t, n) {
		return t = M.from(t), this.checkContent(t), new Rs(this, this.computeAttrs(e), t, N.setFrom(n));
	}
	createAndFill(e = null, t, n) {
		if (e = this.computeAttrs(e), t = M.from(t), t.size) {
			let e = this.contentMatch.fillBefore(t);
			if (!e) return null;
			t = e.append(t);
		}
		let r = this.contentMatch.matchFragment(t), i = r && r.fillBefore(M.empty, !0);
		return i ? new Rs(this, e, t.append(i), N.setFrom(n)) : null;
	}
	validContent(e) {
		let t = this.contentMatch.matchFragment(e);
		if (!t || !t.validEnd) return !1;
		for (let t = 0; t < e.childCount; t++) if (!this.allowsMarks(e.child(t).marks)) return !1;
		return !0;
	}
	checkContent(e) {
		if (!this.validContent(e)) throw RangeError(`Invalid content for node ${this.name}: ${e.toString().slice(0, 50)}`);
	}
	checkAttrs(e) {}
	allowsMarkType(e) {
		return this.markSet == null || this.markSet.indexOf(e) > -1;
	}
	allowsMarks(e) {
		if (this.markSet == null) return !0;
		for (let t = 0; t < e.length; t++) if (!this.allowsMarkType(e[t].type)) return !1;
		return !0;
	}
	allowedMarks(e) {
		if (this.markSet == null) return e;
		let t;
		for (let n = 0; n < e.length; n++) this.allowsMarkType(e[n].type) ? t && t.push(e[n]) : t ||= e.slice(0, n);
		return t ? t.length ? t : N.none : e;
	}
	static compile(t, n) {
		let r = Object.create(null);
		t.forEach((t, i) => r[t] = new e(t, n, i));
		let i = n.spec.topNode || "doc";
		if (!r[i]) throw RangeError("Schema is missing its top node type ('" + i + "')");
		if (!r.text) throw RangeError("Every schema needs a 'text' type");
		for (let e in r.text.attrs) throw RangeError("The text node type should not have attributes");
		return r;
	}
};
function sc(e, t, n) {
	let r = n.split("|");
	return (n) => {
		let i = n === null ? "null" : typeof n;
		if (r.indexOf(i) < 0) throw RangeError(`Expected value of type ${r} for attribute ${t} on type ${e}, got ${i}`);
	};
}
var cc = class {
	constructor(e, t, n) {
		this.hasDefault = Object.prototype.hasOwnProperty.call(n, "default"), this.default = n.default, this.validate = typeof n.validate == "string" ? sc(e, t, n.validate) : n.validate;
	}
	get isRequired() {
		return !this.hasDefault;
	}
}, lc = class e {
	constructor(e, t, n, r) {
		this.name = e, this.rank = t, this.schema = n, this.spec = r, this.attrs = ac(e, r.attrs), this.excluded = null;
		let i = rc(this.attrs);
		this.instance = i ? new N(this, i) : null;
	}
	create(e = null) {
		return !e && this.instance ? this.instance : new N(this, ic(this.attrs, e));
	}
	static compile(t, n) {
		let r = Object.create(null), i = 0;
		return t.forEach((t, a) => r[t] = new e(t, i++, n, a)), r;
	}
	removeFromSet(e) {
		for (var t = 0; t < e.length; t++) e[t].type == this && (e = e.slice(0, t).concat(e.slice(t + 1)), t--);
		return e;
	}
	isInSet(e) {
		for (let t = 0; t < e.length; t++) if (e[t].type == this) return e[t];
	}
	excludes(e) {
		return this.excluded.indexOf(e) > -1;
	}
}, uc = class {
	constructor(e) {
		this.linebreakReplacement = null, this.cached = Object.create(null);
		let t = this.spec = {};
		for (let n in e) t[n] = e[n];
		t.nodes = ds.from(e.nodes), t.marks = ds.from(e.marks || {}), this.nodes = oc.compile(this.spec.nodes, this), this.marks = lc.compile(this.spec.marks, this);
		let n = Object.create(null);
		for (let e in this.nodes) {
			if (e in this.marks) throw RangeError(e + " can not be both a node and a mark");
			let t = this.nodes[e], r = t.spec.content || "", i = t.spec.marks;
			if (t.contentMatch = n[r] || (n[r] = Us.parse(r, this.nodes)), t.inlineContent = t.contentMatch.inlineContent, t.spec.linebreakReplacement) {
				if (this.linebreakReplacement) throw RangeError("Multiple linebreak nodes defined");
				if (!t.isInline || !t.isLeaf) throw RangeError("Linebreak replacement nodes must be inline leaf nodes");
				this.linebreakReplacement = t;
			}
			t.markSet = i == "_" ? null : i ? dc(this, i.split(" ")) : i == "" || !t.inlineContent ? [] : null;
		}
		for (let e in this.marks) {
			let t = this.marks[e], n = t.spec.excludes;
			t.excluded = n == null ? [t] : n == "" ? [] : dc(this, n.split(" "));
		}
		this.nodeFromJSON = (e) => Rs.fromJSON(this, e), this.markFromJSON = (e) => N.fromJSON(this, e), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = Object.create(null);
	}
	node(e, t = null, n, r) {
		if (typeof e == "string") e = this.nodeType(e);
		else if (!(e instanceof oc)) throw RangeError("Invalid node type: " + e);
		else if (e.schema != this) throw RangeError("Node type from different schema used (" + e.name + ")");
		return e.createChecked(t, n, r);
	}
	text(e, t) {
		let n = this.nodes.text;
		return new Bs(n, n.defaultAttrs, e, N.setFrom(t));
	}
	mark(e, t) {
		return typeof e == "string" && (e = this.marks[e]), e.create(t);
	}
	nodeType(e) {
		let t = this.nodes[e];
		if (!t) throw RangeError("Unknown node type: " + e);
		return t;
	}
};
function dc(e, t) {
	let n = [];
	for (let r = 0; r < t.length; r++) {
		let i = t[r], a = e.marks[i], o = a;
		if (a) n.push(a);
		else for (let t in e.marks) {
			let r = e.marks[t];
			(i == "_" || r.spec.group && r.spec.group.split(" ").indexOf(i) > -1) && n.push(o = r);
		}
		if (!o) throw SyntaxError("Unknown mark type: '" + t[r] + "'");
	}
	return n;
}
function fc(e) {
	return e.tag != null;
}
function pc(e) {
	return e.style != null;
}
var mc = class e {
	constructor(e, t) {
		this.schema = e, this.rules = t, this.tags = [], this.styles = [];
		let n = this.matchedStyles = [];
		t.forEach((e) => {
			if (fc(e)) this.tags.push(e);
			else if (pc(e)) {
				let t = /[^=]*/.exec(e.style)[0];
				n.indexOf(t) < 0 && n.push(t), this.styles.push(e);
			}
		}), this.normalizeLists = !this.tags.some((t) => {
			if (!/^(ul|ol)\b/.test(t.tag) || !t.node) return !1;
			let n = e.nodes[t.node];
			return n.contentMatch.matchType(n);
		});
	}
	parse(e, t = {}) {
		let n = new Cc(this, t, !1);
		return n.addAll(e, N.none, t.from, t.to), n.finish();
	}
	parseSlice(e, t = {}) {
		let n = new Cc(this, t, !0);
		return n.addAll(e, N.none, t.from, t.to), P.maxOpen(n.finish());
	}
	matchTag(e, t, n) {
		for (let r = n ? this.tags.indexOf(n) + 1 : 0; r < this.tags.length; r++) {
			let n = this.tags[r];
			if (Tc(e, n.tag) && (n.namespace === void 0 || e.namespaceURI == n.namespace) && (!n.context || t.matchesContext(n.context))) {
				if (n.getAttrs) {
					let t = n.getAttrs(e);
					if (t === !1) continue;
					n.attrs = t || void 0;
				}
				return n;
			}
		}
	}
	matchStyle(e, t, n, r) {
		for (let i = r ? this.styles.indexOf(r) + 1 : 0; i < this.styles.length; i++) {
			let r = this.styles[i], a = r.style;
			if (!(a.indexOf(e) != 0 || r.context && !n.matchesContext(r.context) || a.length > e.length && (a.charCodeAt(e.length) != 61 || a.slice(e.length + 1) != t))) {
				if (r.getAttrs) {
					let e = r.getAttrs(t);
					if (e === !1) continue;
					r.attrs = e || void 0;
				}
				return r;
			}
		}
	}
	static schemaRules(e) {
		let t = [];
		function n(e) {
			let n = e.priority == null ? 50 : e.priority, r = 0;
			for (; r < t.length; r++) {
				let e = t[r];
				if ((e.priority == null ? 50 : e.priority) < n) break;
			}
			t.splice(r, 0, e);
		}
		for (let t in e.marks) {
			let r = e.marks[t].spec.parseDOM;
			r && r.forEach((e) => {
				n(e = Ec(e)), e.mark || e.ignore || e.clearMark || (e.mark = t);
			});
		}
		for (let t in e.nodes) {
			let r = e.nodes[t].spec.parseDOM;
			r && r.forEach((e) => {
				n(e = Ec(e)), e.node || e.ignore || e.mark || (e.node = t);
			});
		}
		return t;
	}
	static fromSchema(t) {
		return t.cached.domParser || (t.cached.domParser = new e(t, e.schemaRules(t)));
	}
}, hc = {
	address: !0,
	article: !0,
	aside: !0,
	blockquote: !0,
	body: !0,
	canvas: !0,
	dd: !0,
	div: !0,
	dl: !0,
	fieldset: !0,
	figcaption: !0,
	figure: !0,
	footer: !0,
	form: !0,
	h1: !0,
	h2: !0,
	h3: !0,
	h4: !0,
	h5: !0,
	h6: !0,
	header: !0,
	hgroup: !0,
	hr: !0,
	li: !0,
	noscript: !0,
	ol: !0,
	output: !0,
	p: !0,
	pre: !0,
	section: !0,
	table: !0,
	tfoot: !0,
	ul: !0
}, gc = {
	head: !0,
	noscript: !0,
	object: !0,
	script: !0,
	style: !0,
	title: !0
}, _c = {
	ol: !0,
	ul: !0
}, vc = 1, yc = 2, bc = 4;
function xc(e, t, n) {
	return t == null ? e && e.whitespace == "pre" ? 3 : n & -5 : (t ? vc : 0) | (t === "full" ? yc : 0);
}
var Sc = class {
	constructor(e, t, n, r, i, a) {
		this.type = e, this.attrs = t, this.marks = n, this.solid = r, this.options = a, this.content = [], this.activeMarks = N.none, this.match = i || (a & bc ? null : e.contentMatch);
	}
	findWrapping(e) {
		if (!this.match) {
			if (!this.type) return [];
			let t = this.type.contentMatch.fillBefore(M.from(e));
			if (t) this.match = this.type.contentMatch.matchFragment(t);
			else {
				let t = this.type.contentMatch, n;
				return (n = t.findWrapping(e.type)) ? (this.match = t, n) : null;
			}
		}
		return this.match.findWrapping(e.type);
	}
	finish(e) {
		if (!(this.options & vc)) {
			let e = this.content[this.content.length - 1], t;
			if (e && e.isText && (t = /[ \t\r\n\u000c]+$/.exec(e.text))) {
				let n = e;
				e.text.length == t[0].length ? this.content.pop() : this.content[this.content.length - 1] = n.withText(n.text.slice(0, n.text.length - t[0].length));
			}
		}
		let t = M.from(this.content);
		return !e && this.match && (t = t.append(this.match.fillBefore(M.empty, !0))), this.type ? this.type.create(this.attrs, t, this.marks) : t;
	}
	inlineContext(e) {
		return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : e.parentNode && !hc.hasOwnProperty(e.parentNode.nodeName.toLowerCase());
	}
}, Cc = class {
	constructor(e, t, n) {
		this.parser = e, this.options = t, this.isOpen = n, this.open = 0, this.localPreserveWS = !1;
		let r = t.topNode, i, a = xc(null, t.preserveWhitespace, 0) | (n ? bc : 0);
		i = r ? new Sc(r.type, r.attrs, N.none, !0, t.topMatch || r.type.contentMatch, a) : n ? new Sc(null, null, N.none, !0, null, a) : new Sc(e.schema.topNodeType, null, N.none, !0, null, a), this.nodes = [i], this.find = t.findPositions, this.needsBlock = !1;
	}
	get top() {
		return this.nodes[this.open];
	}
	addDOM(e, t) {
		e.nodeType == 3 ? this.addTextNode(e, t) : e.nodeType == 1 && this.addElement(e, t);
	}
	addTextNode(e, t) {
		let n = e.nodeValue, r = this.top, i = r.options & yc ? "full" : this.localPreserveWS || (r.options & vc) > 0, { schema: a } = this.parser;
		if (i === "full" || r.inlineContext(e) || /[^ \t\r\n\u000c]/.test(n)) {
			if (!i) {
				if (n = n.replace(/[ \t\r\n\u000c]+/g, " "), /^[ \t\r\n\u000c]/.test(n) && this.open == this.nodes.length - 1) {
					let t = r.content[r.content.length - 1], i = e.previousSibling;
					(!t || i && i.nodeName == "BR" || t.isText && /[ \t\r\n\u000c]$/.test(t.text)) && (n = n.slice(1));
				}
			} else if (i === "full") n = n.replace(/\r\n?/g, "\n");
			else if (a.linebreakReplacement && /[\r\n]/.test(n) && this.top.findWrapping(a.linebreakReplacement.create())) {
				let e = n.split(/\r?\n|\r/);
				for (let n = 0; n < e.length; n++) n && this.insertNode(a.linebreakReplacement.create(), t, !0), e[n] && this.insertNode(a.text(e[n]), t, !/\S/.test(e[n]));
				n = "";
			} else n = n.replace(/\r?\n|\r/g, " ");
			n && this.insertNode(a.text(n), t, !/\S/.test(n)), this.findInText(e);
		} else this.findInside(e);
	}
	addElement(e, t, n) {
		let r = this.localPreserveWS, i = this.top;
		(e.tagName == "PRE" || /pre/.test(e.style && e.style.whiteSpace)) && (this.localPreserveWS = !0);
		let a = e.nodeName.toLowerCase(), o;
		_c.hasOwnProperty(a) && this.parser.normalizeLists && wc(e);
		let s = this.options.ruleFromNode && this.options.ruleFromNode(e) || (o = this.parser.matchTag(e, this, n));
		out: if (s ? s.ignore : gc.hasOwnProperty(a)) this.findInside(e), this.ignoreFallback(e, t);
		else if (!s || s.skip || s.closeParent) {
			s && s.closeParent ? this.open = Math.max(0, this.open - 1) : s && s.skip.nodeType && (e = s.skip);
			let n, r = this.needsBlock;
			if (hc.hasOwnProperty(a)) i.content.length && i.content[0].isInline && this.open && (this.open--, i = this.top), n = !0, i.type || (this.needsBlock = !0);
			else if (!e.firstChild) {
				this.leafFallback(e, t);
				break out;
			}
			let o = s && s.skip ? t : this.readStyles(e, t);
			o && this.addAll(e, o), n && this.sync(i), this.needsBlock = r;
		} else {
			let n = this.readStyles(e, t);
			n && this.addElementByRule(e, s, n, s.consuming === !1 ? o : void 0);
		}
		this.localPreserveWS = r;
	}
	leafFallback(e, t) {
		e.nodeName == "BR" && this.top.type && this.top.type.inlineContent && this.addTextNode(e.ownerDocument.createTextNode("\n"), t);
	}
	ignoreFallback(e, t) {
		e.nodeName != "BR" || this.top.type && this.top.type.inlineContent || this.findPlace(this.parser.schema.text("-"), t, !0);
	}
	readStyles(e, t) {
		let n = e.style;
		if (n && n.length) for (let e = 0; e < this.parser.matchedStyles.length; e++) {
			let r = this.parser.matchedStyles[e], i = n.getPropertyValue(r);
			if (i) for (let e;;) {
				let n = this.parser.matchStyle(r, i, this, e);
				if (!n) break;
				if (n.ignore) return null;
				if (t = n.clearMark ? t.filter((e) => !n.clearMark(e)) : t.concat(this.parser.schema.marks[n.mark].create(n.attrs)), n.consuming === !1) e = n;
				else break;
			}
		}
		return t;
	}
	addElementByRule(e, t, n, r) {
		let i, a;
		if (t.node) {
			if (a = this.parser.schema.nodes[t.node], a.isLeaf) this.insertNode(a.create(t.attrs), n, e.nodeName == "BR") || this.leafFallback(e, n);
			else {
				let e = this.enter(a, t.attrs || null, n, t.preserveWhitespace);
				e && (i = !0, n = e);
			}
		} else {
			let e = this.parser.schema.marks[t.mark];
			n = n.concat(e.create(t.attrs));
		}
		let o = this.top;
		if (a && a.isLeaf) this.findInside(e);
		else if (r) this.addElement(e, n, r);
		else if (t.getContent) this.findInside(e), t.getContent(e, this.parser.schema).forEach((e) => this.insertNode(e, n, !1));
		else {
			let r = e;
			typeof t.contentElement == "string" ? r = e.querySelector(t.contentElement) : typeof t.contentElement == "function" ? r = t.contentElement(e) : t.contentElement && (r = t.contentElement), this.findAround(e, r, !0), this.addAll(r, n), this.findAround(e, r, !1);
		}
		i && this.sync(o) && this.open--;
	}
	addAll(e, t, n, r) {
		let i = n || 0;
		for (let a = n ? e.childNodes[n] : e.firstChild, o = r == null ? null : e.childNodes[r]; a != o; a = a.nextSibling, ++i) this.findAtPoint(e, i), this.addDOM(a, t);
		this.findAtPoint(e, i);
	}
	findPlace(e, t, n) {
		let r, i;
		for (let t = this.open, a = 0; t >= 0; t--) {
			let o = this.nodes[t], s = o.findWrapping(e);
			if (s && (!r || r.length > s.length + a) && (r = s, i = o, !s.length)) break;
			if (o.solid) {
				if (n) break;
				a += 2;
			}
		}
		if (!r) return null;
		this.sync(i);
		for (let e = 0; e < r.length; e++) t = this.enterInner(r[e], null, t, !1);
		return t;
	}
	insertNode(e, t, n) {
		if (e.isInline && this.needsBlock && !this.top.type) {
			let e = this.textblockFromContext();
			e && (t = this.enterInner(e, null, t));
		}
		let r = this.findPlace(e, t, n);
		if (r) {
			this.closeExtra();
			let t = this.top;
			t.match &&= t.match.matchType(e.type);
			let n = N.none;
			for (let i of r.concat(e.marks)) (t.type ? t.type.allowsMarkType(i.type) : Dc(i.type, e.type)) && (n = i.addToSet(n));
			return t.content.push(e.mark(n)), !0;
		}
		return !1;
	}
	enter(e, t, n, r) {
		let i = this.findPlace(e.create(t), n, !1);
		return i &&= this.enterInner(e, t, n, !0, r), i;
	}
	enterInner(e, t, n, r = !1, i) {
		this.closeExtra();
		let a = this.top;
		a.match = a.match && a.match.matchType(e);
		let o = xc(e, i, a.options);
		a.options & bc && a.content.length == 0 && (o |= bc);
		let s = N.none;
		return n = n.filter((t) => !(a.type ? a.type.allowsMarkType(t.type) : Dc(t.type, e)) || (s = t.addToSet(s), !1)), this.nodes.push(new Sc(e, t, s, r, null, o)), this.open++, n;
	}
	closeExtra(e = !1) {
		let t = this.nodes.length - 1;
		if (t > this.open) {
			for (; t > this.open; t--) this.nodes[t - 1].content.push(this.nodes[t].finish(e));
			this.nodes.length = this.open + 1;
		}
	}
	finish() {
		return this.open = 0, this.closeExtra(this.isOpen), this.nodes[0].finish(!!(this.isOpen || this.options.topOpen));
	}
	sync(e) {
		for (let t = this.open; t >= 0; t--) if (this.nodes[t] == e) return this.open = t, !0;
		else this.localPreserveWS && (this.nodes[t].options |= vc);
		return !1;
	}
	get currentPos() {
		this.closeExtra();
		let e = 0;
		for (let t = this.open; t >= 0; t--) {
			let n = this.nodes[t].content;
			for (let t = n.length - 1; t >= 0; t--) e += n[t].nodeSize;
			t && e++;
		}
		return e;
	}
	findAtPoint(e, t) {
		if (this.find) for (let n = 0; n < this.find.length; n++) this.find[n].node == e && this.find[n].offset == t && (this.find[n].pos = this.currentPos);
	}
	findInside(e) {
		if (this.find) for (let t = 0; t < this.find.length; t++) this.find[t].pos == null && e.nodeType == 1 && e.contains(this.find[t].node) && (this.find[t].pos = this.currentPos);
	}
	findAround(e, t, n) {
		if (e != t && this.find) for (let r = 0; r < this.find.length; r++) this.find[r].pos == null && e.nodeType == 1 && e.contains(this.find[r].node) && t.compareDocumentPosition(this.find[r].node) & (n ? 2 : 4) && (this.find[r].pos = this.currentPos);
	}
	findInText(e) {
		if (this.find) for (let t = 0; t < this.find.length; t++) this.find[t].node == e && (this.find[t].pos = this.currentPos - (e.nodeValue.length - this.find[t].offset));
	}
	matchesContext(e) {
		if (e.indexOf("|") > -1) return e.split(/\s*\|\s*/).some(this.matchesContext, this);
		let t = e.split("/"), n = this.options.context, r = !this.isOpen && (!n || n.parent.type == this.nodes[0].type), i = -(n ? n.depth + 1 : 0) + +!r, a = (e, o) => {
			for (; e >= 0; e--) {
				let s = t[e];
				if (s == "") {
					if (e == t.length - 1 || e == 0) continue;
					for (; o >= i; o--) if (a(e - 1, o)) return !0;
					return !1;
				}
				{
					let e = o > 0 || o == 0 && r ? this.nodes[o].type : n && o >= i ? n.node(o - i).type : null;
					if (!e || e.name != s && !e.isInGroup(s)) return !1;
					o--;
				}
			}
			return !0;
		};
		return a(t.length - 1, this.open);
	}
	textblockFromContext() {
		let e = this.options.context;
		if (e) for (let t = e.depth; t >= 0; t--) {
			let n = e.node(t).contentMatchAt(e.indexAfter(t)).defaultType;
			if (n && n.isTextblock && n.defaultAttrs) return n;
		}
		for (let e in this.parser.schema.nodes) {
			let t = this.parser.schema.nodes[e];
			if (t.isTextblock && t.defaultAttrs) return t;
		}
	}
};
function wc(e) {
	for (let t = e.firstChild, n = null; t; t = t.nextSibling) {
		let e = t.nodeType == 1 ? t.nodeName.toLowerCase() : null;
		e && _c.hasOwnProperty(e) && n ? (n.appendChild(t), t = n) : e == "li" ? n = t : e && (n = null);
	}
}
function Tc(e, t) {
	return (e.matches || e.msMatchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector).call(e, t);
}
function Ec(e) {
	let t = {};
	for (let n in e) t[n] = e[n];
	return t;
}
function Dc(e, t) {
	let n = t.schema.nodes;
	for (let r in n) {
		let i = n[r];
		if (!i.allowsMarkType(e)) continue;
		let a = [], o = (e) => {
			a.push(e);
			for (let n = 0; n < e.edgeCount; n++) {
				let { type: r, next: i } = e.edge(n);
				if (r == t || a.indexOf(i) < 0 && o(i)) return !0;
			}
		};
		if (o(i.contentMatch)) return !0;
	}
}
var Oc = class e {
	constructor(e, t) {
		this.nodes = e, this.marks = t;
	}
	serializeFragment(e, t = {}, n) {
		n ||= Ac(t).createDocumentFragment();
		let r = n, i = [];
		return e.forEach((e) => {
			if (i.length || e.marks.length) {
				let n = 0, a = 0;
				for (; n < i.length && a < e.marks.length;) {
					let t = e.marks[a];
					if (!this.marks[t.type.name]) a++;
					else {
						if (!t.eq(i[n][0]) || t.type.spec.spanning === !1) break;
						n++, a++;
					}
				}
				for (; n < i.length;) r = i.pop()[1];
				for (; a < e.marks.length;) {
					let n = e.marks[a++], o = this.serializeMark(n, e.isInline, t);
					o && (i.push([n, r]), r.appendChild(o.dom), r = o.contentDOM || o.dom);
				}
			}
			r.appendChild(this.serializeNodeInner(e, t));
		}), n;
	}
	serializeNodeInner(e, t) {
		if (e.isText) return Ac(t).createTextNode(e.text);
		let { dom: n, contentDOM: r } = Pc(Ac(t), this.nodes[e.type.name](e), null, e.attrs);
		if (r) {
			if (e.isLeaf) throw RangeError("Content hole not allowed in a leaf node spec");
			this.serializeFragment(e.content, t, r);
		}
		return n;
	}
	serializeNode(e, t = {}) {
		let n = this.serializeNodeInner(e, t);
		for (let r = e.marks.length - 1; r >= 0; r--) {
			let i = this.serializeMark(e.marks[r], e.isInline, t);
			i && ((i.contentDOM || i.dom).appendChild(n), n = i.dom);
		}
		return n;
	}
	serializeMark(e, t, n = {}) {
		let r = this.marks[e.type.name];
		return r && Pc(Ac(n), r(e, t), null, e.attrs);
	}
	static renderSpec(e, t, n = null, r) {
		return typeof t == "string" ? { dom: e.createTextNode(t) } : Pc(e, t, n, r);
	}
	static fromSchema(t) {
		return t.cached.domSerializer || (t.cached.domSerializer = new e(this.nodesFromSchema(t), this.marksFromSchema(t)));
	}
	static nodesFromSchema(e) {
		let t = kc(e.nodes);
		return t.text ||= (e) => e.text, t;
	}
	static marksFromSchema(e) {
		return kc(e.marks);
	}
};
function kc(e) {
	let t = {};
	for (let n in e) {
		let r = e[n].spec.toDOM;
		r && (t[n] = r);
	}
	return t;
}
function Ac(e) {
	return e.document || window.document;
}
var jc = /* @__PURE__ */ new WeakMap();
function Mc(e) {
	let t = jc.get(e);
	return t === void 0 && jc.set(e, t = Nc(e)), t;
}
function Nc(e) {
	let t = null;
	function n(e) {
		if (e && typeof e == "object") {
			if (Array.isArray(e)) {
				if (typeof e[0] == "string") t ||= [], t.push(e);
				else for (let t = 0; t < e.length; t++) n(e[t]);
			} else for (let t in e) n(e[t]);
		}
	}
	return n(e), t;
}
function Pc(e, t, n, r) {
	if (t.nodeType == 1) return { dom: t };
	if (t.dom && t.dom.nodeType == 1) return t;
	let i = t[0], a;
	if (typeof i != "string") throw RangeError("Invalid array passed to renderSpec");
	if (r && (a = Mc(r)) && a.indexOf(t) > -1) throw RangeError("Using an array from an attribute object as a DOM spec. This may be an attempted cross site scripting attack.");
	let o = i.indexOf(" ");
	o > 0 && (n = i.slice(0, o), i = i.slice(o + 1));
	let s, c = n ? e.createElementNS(n, i) : e.createElement(i), l = t[1], u = 1;
	if (l && typeof l == "object" && l.nodeType == null && !Array.isArray(l)) {
		u = 2;
		for (let e in l) if (l[e] != null) {
			let t = e.indexOf(" ");
			t > 0 ? c.setAttributeNS(e.slice(0, t), e.slice(t + 1), l[e]) : e == "style" && c.style ? c.style.cssText = l[e] : c.setAttribute(e, l[e]);
		}
	}
	for (let i = u; i < t.length; i++) {
		let a = t[i];
		if (a === 0) {
			if (i < t.length - 1 || i > u) throw RangeError("Content hole must be the only child of its parent node");
			return {
				dom: c,
				contentDOM: c
			};
		}
		if (typeof a == "string") c.appendChild(e.createTextNode(a));
		else {
			let { dom: t, contentDOM: i } = Pc(e, a, n, r);
			if (c.appendChild(t), i) {
				if (s) throw RangeError("Multiple content holes");
				s = i;
			}
		}
	}
	return {
		dom: c,
		contentDOM: s
	};
}
// node_modules/prosemirror-transform/dist/index.js
var Fc = 65535, Ic = 2 ** 16;
function Lc(e, t) {
	return e + t * Ic;
}
function Rc(e) {
	return e & Fc;
}
function zc(e) {
	return (e - (e & Fc)) / Ic;
}
var Bc = 1, Vc = 2, Hc = 4, Uc = 8, Wc = class {
	constructor(e, t, n) {
		this.pos = e, this.delInfo = t, this.recover = n;
	}
	get deleted() {
		return (this.delInfo & Uc) > 0;
	}
	get deletedBefore() {
		return (this.delInfo & 5) > 0;
	}
	get deletedAfter() {
		return (this.delInfo & 6) > 0;
	}
	get deletedAcross() {
		return (this.delInfo & Hc) > 0;
	}
}, Gc = class e {
	constructor(t, n = !1) {
		if (this.ranges = t, this.inverted = n, !t.length && e.empty) return e.empty;
	}
	recover(e) {
		let t = 0, n = Rc(e);
		if (!this.inverted) for (let e = 0; e < n; e++) t += this.ranges[e * 3 + 2] - this.ranges[e * 3 + 1];
		return this.ranges[n * 3] + t + zc(e);
	}
	mapResult(e, t = 1) {
		return this._map(e, t, !1);
	}
	map(e, t = 1) {
		return this._map(e, t, !0);
	}
	_map(e, t, n) {
		let r = 0, i = this.inverted ? 2 : 1, a = this.inverted ? 1 : 2;
		for (let o = 0; o < this.ranges.length; o += 3) {
			let s = this.ranges[o] - (this.inverted ? r : 0);
			if (s > e) break;
			let c = this.ranges[o + i], l = this.ranges[o + a], u = s + c;
			if (e <= u) {
				let i = c ? e == s ? -1 : e == u ? 1 : t : t, a = s + r + (i < 0 ? 0 : l);
				if (n) return a;
				let d = e == (t < 0 ? s : u) ? null : Lc(o / 3, e - s), f = 0;
				return c && (f |= e == s ? Vc : e == u ? Bc : Hc, (t < 0 ? e != s : e != u) && (f |= Uc)), new Wc(a, f, d);
			}
			r += l - c;
		}
		return n ? e + r : new Wc(e + r, 0, null);
	}
	touches(e, t) {
		let n = 0, r = Rc(t), i = this.inverted ? 2 : 1, a = this.inverted ? 1 : 2;
		for (let t = 0; t < this.ranges.length; t += 3) {
			let o = this.ranges[t] - (this.inverted ? n : 0);
			if (o > e) break;
			let s = this.ranges[t + i];
			if (e <= o + s && t == r * 3) return !0;
			n += this.ranges[t + a] - s;
		}
		return !1;
	}
	forEach(e) {
		let t = this.inverted ? 2 : 1, n = this.inverted ? 1 : 2;
		for (let r = 0, i = 0; r < this.ranges.length; r += 3) {
			let a = this.ranges[r], o = a - (this.inverted ? i : 0), s = a + (this.inverted ? 0 : i), c = this.ranges[r + t], l = this.ranges[r + n];
			e(o, o + c, s, s + l), i += l - c;
		}
	}
	invert() {
		return new e(this.ranges, !this.inverted);
	}
	toString() {
		return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
	}
	static offset(t) {
		return t == 0 ? e.empty : new e(t < 0 ? [
			0,
			-t,
			0
		] : [
			0,
			0,
			t
		]);
	}
};
Gc.empty = new Gc([]);
var Kc = class e {
	constructor(e, t, n = 0, r = e ? e.length : 0) {
		this.mirror = t, this.from = n, this.to = r, this._maps = e || [], this.ownData = !(e || t);
	}
	get maps() {
		return this._maps;
	}
	slice(t = 0, n = this.maps.length) {
		return new e(this._maps, this.mirror, t, n);
	}
	appendMap(e, t) {
		this.ownData ||= (this._maps = this._maps.slice(), this.mirror = this.mirror && this.mirror.slice(), !0), this.to = this._maps.push(e), t != null && this.setMirror(this._maps.length - 1, t);
	}
	appendMapping(e) {
		for (let t = e.from, n = this._maps.length; t < e.to; t++) {
			let r = e.getMirror(t);
			r != null && (r = r < t && r >= e.from ? n + (r - e.from) : void 0), this.appendMap(e._maps[t], r);
		}
	}
	getMirror(e) {
		if (this.mirror) {
			for (let t = 0; t < this.mirror.length; t++) if (this.mirror[t] == e) return this.mirror[t + (t % 2 ? -1 : 1)];
		}
	}
	setMirror(e, t) {
		this.mirror ||= [], this.mirror.push(e, t);
	}
	appendMappingInverted(e) {
		for (let t = e.to - 1, n = this._maps.length + e._maps.length; t >= e.from; t--) {
			let r = e.getMirror(t);
			r != null && (r = r > t && r < e.to ? n - (r - e.from) - 1 : void 0), this.appendMap(e._maps[t].invert(), r);
		}
	}
	invert() {
		let t = new e();
		return t.appendMappingInverted(this), t;
	}
	map(e, t = 1) {
		if (this.mirror) return this._map(e, t, !0);
		for (let n = this.from; n < this.to; n++) e = this._maps[n].map(e, t);
		return e;
	}
	mapResult(e, t = 1) {
		return this._map(e, t, !1);
	}
	_map(e, t, n) {
		let r = 0;
		for (let n = this.from; n < this.to; n++) {
			let i = this._maps[n].mapResult(e, t);
			if (i.recover != null) {
				let t = this.getMirror(n);
				if (t != null && t > n && t < this.to) {
					n = t, e = this._maps[t].recover(i.recover);
					continue;
				}
			}
			r |= i.delInfo, e = i.pos;
		}
		return n ? e : new Wc(e, r, null);
	}
}, qc = Object.create(null), F = class {
	getMap() {
		return Gc.empty;
	}
	merge(e) {
		return null;
	}
	static fromJSON(e, t) {
		if (!t || !t.stepType) throw RangeError("Invalid input for Step.fromJSON");
		let n = qc[t.stepType];
		if (!n) throw RangeError(`No step type ${t.stepType} defined`);
		return n.fromJSON(e, t);
	}
	static jsonID(e, t) {
		if (e in qc) throw RangeError("Duplicate use of step JSON ID " + e);
		return qc[e] = t, t.prototype.jsonID = e, t;
	}
}, Jc = class e {
	constructor(e, t) {
		this.doc = e, this.failed = t;
	}
	static ok(t) {
		return new e(t, null);
	}
	static fail(t) {
		return new e(null, t);
	}
	static fromReplace(t, n, r, i) {
		try {
			return e.ok(t.replace(n, r, i));
		} catch (t) {
			if (t instanceof ys) return e.fail(t.message);
			throw t;
		}
	}
};
function Yc(e, t, n) {
	let r = [];
	for (let i = 0; i < e.childCount; i++) {
		let a = e.child(i);
		a.content.size && (a = a.copy(Yc(a.content, t, a))), a.isInline && (a = t(a, n, i)), r.push(a);
	}
	return M.fromArray(r);
}
var Xc = class e extends F {
	constructor(e, t, n) {
		super(), this.from = e, this.to = t, this.mark = n;
	}
	apply(e) {
		let t = e.slice(this.from, this.to), n = e.resolve(this.from), r = n.node(n.sharedDepth(this.to)), i = new P(Yc(t.content, (e, t) => !e.isAtom || !t.type.allowsMarkType(this.mark.type) ? e : e.mark(this.mark.addToSet(e.marks)), r), t.openStart, t.openEnd);
		return Jc.fromReplace(e, this.from, this.to, i);
	}
	invert(t) {
		let n = [];
		return t.nodesBetween(this.from, this.to, (t, r) => {
			if (t.isInline && t.isAtom) {
				let i = this.mark.addToSet(t.marks);
				if (!N.sameSet(i, t.marks)) {
					let a = Math.max(this.from, r), o = Math.min(this.to, r + t.nodeSize);
					Qc(Zc, a, o, this.mark, n);
					for (let r of t.marks) r.isInSet(i) || Qc(e, a, o, r, n);
				}
			}
		}), n.length == 1 ? n[0] : new $c(n);
	}
	map(t) {
		let n = t.map(this.from, 1), r = t.map(this.to, -1);
		return n >= r ? null : new e(n, r, this.mark);
	}
	merge(t) {
		return t instanceof e && t.mark.eq(this.mark) && this.from <= t.to && this.to >= t.from ? new e(Math.min(this.from, t.from), Math.max(this.to, t.to), this.mark) : null;
	}
	toJSON() {
		return {
			stepType: "addMark",
			mark: this.mark.toJSON(),
			from: this.from,
			to: this.to
		};
	}
	static fromJSON(t, n) {
		if (typeof n.from != "number" || typeof n.to != "number") throw RangeError("Invalid input for AddMarkStep.fromJSON");
		return new e(n.from, n.to, t.markFromJSON(n.mark));
	}
};
F.jsonID("addMark", Xc);
var Zc = class e extends F {
	constructor(e, t, n) {
		super(), this.from = e, this.to = t, this.mark = n;
	}
	apply(e) {
		let t = e.slice(this.from, this.to), n = new P(Yc(t.content, (e) => e.mark(this.mark.removeFromSet(e.marks)), e), t.openStart, t.openEnd);
		return Jc.fromReplace(e, this.from, this.to, n);
	}
	invert(e) {
		let t = [];
		return e.nodesBetween(this.from, this.to, (e, n) => {
			e.isInline && e.isAtom && this.mark.isInSet(e.marks) && Qc(Xc, Math.max(this.from, n), Math.min(this.to, n + e.nodeSize), this.mark, t);
		}), t.length == 1 ? t[0] : new $c(t);
	}
	map(t) {
		let n = t.map(this.from, 1), r = t.map(this.to, -1);
		return n >= r ? null : new e(n, r, this.mark);
	}
	merge(t) {
		return t instanceof e && t.mark.eq(this.mark) && this.from <= t.to && this.to >= t.from ? new e(Math.min(this.from, t.from), Math.max(this.to, t.to), this.mark) : null;
	}
	toJSON() {
		return {
			stepType: "removeMark",
			mark: this.mark.toJSON(),
			from: this.from,
			to: this.to
		};
	}
	static fromJSON(t, n) {
		if (typeof n.from != "number" || typeof n.to != "number") throw RangeError("Invalid input for RemoveMarkStep.fromJSON");
		return new e(n.from, n.to, t.markFromJSON(n.mark));
	}
};
F.jsonID("removeMark", Zc);
function Qc(e, t, n, r, i) {
	let a = i.length ? i[i.length - 1] : null;
	a && a instanceof e && a.to == t && a.mark.eq(r) ? i[i.length - 1] = new e(a.from, n, r) : i.push(new e(t, n, r));
}
var $c = class e extends F {
	constructor(e) {
		super(), this.steps = e;
	}
	apply(e) {
		for (let t of this.steps) {
			let n = t.apply(e);
			if (!n.doc) return n;
			e = n.doc;
		}
		return new Jc(e, null);
	}
	invert(t) {
		return new e(this.steps.map((e) => e.invert(t)));
	}
	map(t) {
		let n = [];
		for (let e of this.steps) {
			let r = e.map(t);
			r && n.push(r);
		}
		return n.length ? new e(n) : null;
	}
	toJSON() {
		return {
			stepType: "markSet",
			steps: this.steps.map((e) => e.toJSON())
		};
	}
	static fromJSON(t, n) {
		if (!Array.isArray(n.steps) || !n.steps.every((e) => e.stepType == "addMark" || e.stepType == "removeMark")) throw RangeError("Invalid JSON for MarkSetStep");
		return new e(n.steps.map((e) => F.fromJSON(t, e)));
	}
};
F.jsonID("markSet", $c);
var el = class e extends F {
	constructor(e, t) {
		super(), this.pos = e, this.mark = t;
	}
	apply(e) {
		let t = e.nodeAt(this.pos);
		if (!t) return Jc.fail("No node at mark step's position");
		let n = t.type.create(t.attrs, null, this.mark.addToSet(t.marks));
		return Jc.fromReplace(e, this.pos, this.pos + 1, new P(M.from(n), 0, +!t.isLeaf));
	}
	invert(t) {
		let n = t.nodeAt(this.pos);
		if (n) {
			let t = this.mark.addToSet(n.marks);
			if (t.length == n.marks.length) {
				for (let r = 0; r < n.marks.length; r++) if (!n.marks[r].isInSet(t)) return new e(this.pos, n.marks[r]);
				return new e(this.pos, this.mark);
			}
		}
		return new tl(this.pos, this.mark);
	}
	map(t) {
		let n = t.mapResult(this.pos, 1);
		return n.deletedAfter ? null : new e(n.pos, this.mark);
	}
	toJSON() {
		return {
			stepType: "addNodeMark",
			pos: this.pos,
			mark: this.mark.toJSON()
		};
	}
	static fromJSON(t, n) {
		if (typeof n.pos != "number") throw RangeError("Invalid input for AddNodeMarkStep.fromJSON");
		return new e(n.pos, t.markFromJSON(n.mark));
	}
};
F.jsonID("addNodeMark", el);
var tl = class e extends F {
	constructor(e, t) {
		super(), this.pos = e, this.mark = t;
	}
	apply(e) {
		let t = e.nodeAt(this.pos);
		if (!t) return Jc.fail("No node at mark step's position");
		let n = t.type.create(t.attrs, null, this.mark.removeFromSet(t.marks));
		return Jc.fromReplace(e, this.pos, this.pos + 1, new P(M.from(n), 0, +!t.isLeaf));
	}
	invert(e) {
		let t = e.nodeAt(this.pos);
		return !t || !this.mark.isInSet(t.marks) ? this : new el(this.pos, this.mark);
	}
	map(t) {
		let n = t.mapResult(this.pos, 1);
		return n.deletedAfter ? null : new e(n.pos, this.mark);
	}
	toJSON() {
		return {
			stepType: "removeNodeMark",
			pos: this.pos,
			mark: this.mark.toJSON()
		};
	}
	static fromJSON(t, n) {
		if (typeof n.pos != "number") throw RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
		return new e(n.pos, t.markFromJSON(n.mark));
	}
};
F.jsonID("removeNodeMark", tl);
var nl = class e extends F {
	constructor(e, t, n, r = !1) {
		super(), this.from = e, this.to = t, this.slice = n, this.structure = r;
	}
	apply(e) {
		return this.structure && il(e, this.from, this.to) ? Jc.fail("Structure replace would overwrite content") : Jc.fromReplace(e, this.from, this.to, this.slice);
	}
	getMap() {
		return new Gc([
			this.from,
			this.to - this.from,
			this.slice.size
		]);
	}
	invert(t) {
		return new e(this.from, this.from + this.slice.size, t.slice(this.from, this.to));
	}
	map(t) {
		let n = t.mapResult(this.to, -1), r = this.from == this.to && e.MAP_BIAS < 0 ? n : t.mapResult(this.from, 1);
		return r.deletedAcross && n.deletedAcross ? null : new e(r.pos, Math.max(r.pos, n.pos), this.slice, this.structure);
	}
	merge(t) {
		if (!(t instanceof e) || t.structure || this.structure) return null;
		if (this.from + this.slice.size == t.from && !this.slice.openEnd && !t.slice.openStart) {
			let n = this.slice.size + t.slice.size == 0 ? P.empty : new P(this.slice.content.append(t.slice.content), this.slice.openStart, t.slice.openEnd);
			return new e(this.from, this.to + (t.to - t.from), n, this.structure);
		}
		if (t.to == this.from && !this.slice.openStart && !t.slice.openEnd) {
			let n = this.slice.size + t.slice.size == 0 ? P.empty : new P(t.slice.content.append(this.slice.content), t.slice.openStart, this.slice.openEnd);
			return new e(t.from, this.to, n, this.structure);
		}
		return null;
	}
	toJSON() {
		let e = {
			stepType: "replace",
			from: this.from,
			to: this.to
		};
		return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
	}
	static fromJSON(t, n) {
		if (typeof n.from != "number" || typeof n.to != "number") throw RangeError("Invalid input for ReplaceStep.fromJSON");
		return new e(n.from, n.to, P.fromJSON(t, n.slice), !!n.structure);
	}
};
nl.MAP_BIAS = 1, F.jsonID("replace", nl);
var rl = class e extends F {
	constructor(e, t, n, r, i, a, o = !1) {
		super(), this.from = e, this.to = t, this.gapFrom = n, this.gapTo = r, this.slice = i, this.insert = a, this.structure = o;
	}
	apply(e) {
		if (this.structure && (il(e, this.from, this.gapFrom) || il(e, this.gapTo, this.to))) return Jc.fail("Structure gap-replace would overwrite content");
		let t = e.slice(this.gapFrom, this.gapTo);
		if (t.openStart || t.openEnd) return Jc.fail("Gap is not a flat range");
		let n = this.slice.insertAt(this.insert, t.content);
		return n ? Jc.fromReplace(e, this.from, this.to, n) : Jc.fail("Content does not fit in gap");
	}
	getMap() {
		return new Gc([
			this.from,
			this.gapFrom - this.from,
			this.insert,
			this.gapTo,
			this.to - this.gapTo,
			this.slice.size - this.insert
		]);
	}
	invert(t) {
		let n = this.gapTo - this.gapFrom;
		return new e(this.from, this.from + this.slice.size + n, this.from + this.insert, this.from + this.insert + n, t.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
	}
	map(t) {
		let n = t.mapResult(this.from, 1), r = t.mapResult(this.to, -1), i = this.from == this.gapFrom ? n.pos : t.map(this.gapFrom, -1), a = this.to == this.gapTo ? r.pos : t.map(this.gapTo, 1);
		return n.deletedAcross && r.deletedAcross || i < n.pos || a > r.pos || i > a ? null : new e(n.pos, r.pos, i, a, this.slice, this.insert, this.structure);
	}
	toJSON() {
		let e = {
			stepType: "replaceAround",
			from: this.from,
			to: this.to,
			gapFrom: this.gapFrom,
			gapTo: this.gapTo,
			insert: this.insert
		};
		return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
	}
	static fromJSON(t, n) {
		if (typeof n.from != "number" || typeof n.to != "number" || typeof n.gapFrom != "number" || typeof n.gapTo != "number" || typeof n.insert != "number") throw RangeError("Invalid input for ReplaceAroundStep.fromJSON");
		return new e(n.from, n.to, n.gapFrom, n.gapTo, P.fromJSON(t, n.slice), n.insert, !!n.structure);
	}
};
F.jsonID("replaceAround", rl);
function il(e, t, n) {
	let r = e.resolve(t), i = n - t, a = r.depth;
	for (; i > 0 && a > 0 && r.indexAfter(a) == r.node(a).childCount;) a--, i--;
	if (i > 0) {
		let e = r.node(a).maybeChild(r.indexAfter(a));
		for (; i > 0;) {
			if (!e || e.isLeaf) return !0;
			e = e.firstChild, i--;
		}
	}
	return !1;
}
function al(e, t, n, r) {
	let i = [];
	e.doc.nodesBetween(t, n, (e, a, o) => {
		if (!e.isInline) return;
		let s = e.marks;
		!r.isInSet(s) && o.type.allowsMarkType(r.type) && Qc(Xc, Math.max(a, t), Math.min(a + e.nodeSize, n), r, i);
	}), i.forEach((t) => e.step(t));
}
function ol(e, t, n, r) {
	let i = [], a = 0;
	e.doc.nodesBetween(t, n, (e, o) => {
		if (!e.isInline || !e.isAtom) return;
		a++;
		let s = null;
		if (r instanceof lc) {
			let t = e.marks, n;
			for (; n = r.isInSet(t);) (s ||= []).push(n), t = n.removeFromSet(t);
		} else r ? r.isInSet(e.marks) && (s = [r]) : s = e.marks;
		if (s && s.length) {
			let r = Math.min(o + e.nodeSize, n);
			for (let e = 0; e < s.length; e++) {
				let n = s[e], c;
				for (let e = 0; e < i.length; e++) {
					let t = i[e];
					t.step == a - 1 && n.eq(i[e].style) && (c = t);
				}
				c ? (c.to = r, c.step = a) : i.push({
					style: n,
					from: Math.max(o, t),
					to: r,
					step: a
				});
			}
		}
	}), i.forEach((t) => e.step(new Zc(t.from, t.to, t.style)));
}
function sl(e, t, n, r = n.contentMatch, i = !0) {
	let a = e.doc.nodeAt(t), o = [], s = t + 1;
	for (let t = 0; t < a.childCount; t++) {
		let c = a.child(t), l = s + c.nodeSize, u = r.matchType(c.type);
		if (!u) o.push(new nl(s, l, P.empty));
		else {
			r = u;
			for (let t = 0; t < c.marks.length; t++) n.allowsMarkType(c.marks[t].type) || e.step(new Zc(s, l, c.marks[t]));
			if (i && c.isText && n.whitespace != "pre") {
				let e, t = /\r?\n|\r/g, r;
				for (; e = t.exec(c.text);) r ||= new P(M.from(n.schema.text(" ", n.allowedMarks(c.marks))), 0, 0), o.push(new nl(s + e.index, s + e.index + e[0].length, r));
			}
		}
		s = l;
	}
	if (!r.validEnd) {
		let t = r.fillBefore(M.empty, !0);
		e.replace(s, s, new P(t, 0, 0));
	}
	for (let t = o.length - 1; t >= 0; t--) e.step(o[t]);
}
function cl(e, t, n) {
	return (t == 0 || e.canReplace(t, e.childCount)) && (n == e.childCount || e.canReplace(0, n));
}
function ll(e) {
	let t = e.parent.content.cutByIndex(e.startIndex, e.endIndex);
	for (let n = e.depth, r = 0, i = 0;; --n) {
		let a = e.$from.node(n), o = e.$from.index(n) + r, s = e.$to.indexAfter(n) - i;
		if (n < e.depth && a.canReplace(o, s, t)) return n;
		if (n == 0 || a.type.spec.isolating || !cl(a, o, s)) break;
		o && (r = 1), s < a.childCount && (i = 1);
	}
	return null;
}
function ul(e, t, n) {
	let { $from: r, $to: i, depth: a } = t, o = r.before(a + 1), s = i.after(a + 1), c = o, l = s, u = M.empty, d = 0;
	for (let e = a, t = !1; e > n; e--) t || r.index(e) > 0 ? (t = !0, u = M.from(r.node(e).copy(u)), d++) : c--;
	let f = M.empty, p = 0;
	for (let e = a, t = !1; e > n; e--) t || i.after(e + 1) < i.end(e) ? (t = !0, f = M.from(i.node(e).copy(f)), p++) : l++;
	e.step(new rl(c, l, o, s, new P(u.append(f), d, p), u.size - d, !0));
}
function dl(e, t, n = null, r = e) {
	let i = pl(e, t), a = i && ml(r, t);
	return a ? i.map(fl).concat({
		type: t,
		attrs: n
	}).concat(a.map(fl)) : null;
}
function fl(e) {
	return {
		type: e,
		attrs: null
	};
}
function pl(e, t) {
	let { parent: n, startIndex: r, endIndex: i } = e, a = n.contentMatchAt(r).findWrapping(t);
	if (!a) return null;
	let o = a.length ? a[0] : t;
	return n.canReplaceWith(r, i, o) ? a : null;
}
function ml(e, t) {
	let { parent: n, startIndex: r, endIndex: i } = e, a = n.child(r), o = t.contentMatch.findWrapping(a.type);
	if (!o) return null;
	let s = (o.length ? o[o.length - 1] : t).contentMatch;
	for (let e = r; s && e < i; e++) s = s.matchType(n.child(e).type);
	return !s || !s.validEnd ? null : o;
}
function hl(e, t, n) {
	let r = M.empty;
	for (let e = n.length - 1; e >= 0; e--) {
		if (r.size) {
			let t = n[e].type.contentMatch.matchFragment(r);
			if (!t || !t.validEnd) throw RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
		}
		r = M.from(n[e].type.create(n[e].attrs, r));
	}
	let i = t.start, a = t.end;
	e.step(new rl(i, a, i, a, new P(r, 0, 0), n.length, !0));
}
function gl(e, t, n, r, i) {
	if (!r.isTextblock) throw RangeError("Type given to setBlockType should be a textblock");
	let a = e.steps.length;
	e.doc.nodesBetween(t, n, (t, n) => {
		let o = typeof i == "function" ? i(t) : i;
		if (t.isTextblock && !t.hasMarkup(r, o) && yl(e.doc, e.mapping.slice(a).map(n), r)) {
			let i = null;
			if (r.schema.linebreakReplacement) {
				let e = r.whitespace == "pre", t = !!r.contentMatch.matchType(r.schema.linebreakReplacement);
				e && !t ? i = !1 : !e && t && (i = !0);
			}
			i === !1 && vl(e, t, n, a), sl(e, e.mapping.slice(a).map(n, 1), r, void 0, i === null);
			let s = e.mapping.slice(a), c = s.map(n, 1), l = s.map(n + t.nodeSize, 1);
			return e.step(new rl(c, l, c + 1, l - 1, new P(M.from(r.create(o, null, t.marks)), 0, 0), 1, !0)), i === !0 && _l(e, t, n, a), !1;
		}
	});
}
function _l(e, t, n, r) {
	t.forEach((i, a) => {
		if (i.isText) {
			let o, s = /\r?\n|\r/g;
			for (; o = s.exec(i.text);) {
				let i = e.mapping.slice(r).map(n + 1 + a + o.index);
				e.replaceWith(i, i + 1, t.type.schema.linebreakReplacement.create());
			}
		}
	});
}
function vl(e, t, n, r) {
	t.forEach((i, a) => {
		if (i.type == i.type.schema.linebreakReplacement) {
			let i = e.mapping.slice(r).map(n + 1 + a);
			e.replaceWith(i, i + 1, t.type.schema.text("\n"));
		}
	});
}
function yl(e, t, n) {
	let r = e.resolve(t), i = r.index();
	return r.parent.canReplaceWith(i, i + 1, n);
}
function bl(e, t, n, r, i) {
	let a = e.doc.nodeAt(t);
	if (!a) throw RangeError("No node at given position");
	n ||= a.type;
	let o = n.create(r, null, i || a.marks);
	if (a.isLeaf) return e.replaceWith(t, t + a.nodeSize, o);
	if (!n.validContent(a.content)) throw RangeError("Invalid content for node type " + n.name);
	e.step(new rl(t, t + a.nodeSize, t + 1, t + a.nodeSize - 1, new P(M.from(o), 0, 0), 1, !0));
}
function xl(e, t, n = 1, r) {
	let i = e.resolve(t), a = i.depth - n, o = r && r[r.length - 1] || i.parent;
	if (a < 0 || i.parent.type.spec.isolating || !i.parent.canReplace(i.index(), i.parent.childCount) || !o.type.validContent(i.parent.content.cutByIndex(i.index(), i.parent.childCount))) return !1;
	for (let e = i.depth - 1, t = n - 2; e > a; e--, t--) {
		let n = i.node(e), a = i.index(e);
		if (n.type.spec.isolating) return !1;
		let o = n.content.cutByIndex(a, n.childCount), s = r && r[t + 1];
		s && (o = o.replaceChild(0, s.type.create(s.attrs)));
		let c = r && r[t] || n;
		if (!n.canReplace(a + 1, n.childCount) || !c.type.validContent(o)) return !1;
	}
	let s = i.indexAfter(a), c = r && r[0];
	return i.node(a).canReplaceWith(s, s, c ? c.type : i.node(a + 1).type);
}
function Sl(e, t, n = 1, r) {
	let i = e.doc.resolve(t), a = M.empty, o = M.empty;
	for (let e = i.depth, t = i.depth - n, s = n - 1; e > t; e--, s--) {
		a = M.from(i.node(e).copy(a));
		let t = r && r[s];
		o = M.from(t ? t.type.create(t.attrs, o) : i.node(e).copy(o));
	}
	e.step(new nl(t, t, new P(a.append(o), n, n), !0));
}
function Cl(e, t) {
	let n = e.resolve(t), r = n.index();
	return Tl(n.nodeBefore, n.nodeAfter) && n.parent.canReplace(r, r + 1);
}
function wl(e, t) {
	t.content.size || e.type.compatibleContent(t.type);
	let n = e.contentMatchAt(e.childCount), { linebreakReplacement: r } = e.type.schema;
	for (let i = 0; i < t.childCount; i++) {
		let a = t.child(i), o = a.type == r ? e.type.schema.nodes.text : a.type;
		if (n = n.matchType(o), !n || !e.type.allowsMarks(a.marks)) return !1;
	}
	return n.validEnd;
}
function Tl(e, t) {
	return !!(e && t && !e.isLeaf && wl(e, t));
}
function El(e, t, n = -1) {
	let r = e.resolve(t);
	for (let e = r.depth;; e--) {
		let i, a, o = r.index(e);
		if (e == r.depth ? (i = r.nodeBefore, a = r.nodeAfter) : n > 0 ? (i = r.node(e + 1), o++, a = r.node(e).maybeChild(o)) : (i = r.node(e).maybeChild(o - 1), a = r.node(e + 1)), i && !i.isTextblock && Tl(i, a) && r.node(e).canReplace(o, o + 1)) return t;
		if (e == 0) break;
		t = n < 0 ? r.before(e) : r.after(e);
	}
}
function Dl(e, t, n) {
	let r = null, { linebreakReplacement: i } = e.doc.type.schema, a = e.doc.resolve(t - n), o = a.node().type;
	if (i && o.inlineContent) {
		let e = o.whitespace == "pre", t = !!o.contentMatch.matchType(i);
		e && !t ? r = !1 : !e && t && (r = !0);
	}
	let s = e.steps.length;
	if (r === !1) {
		let r = e.doc.resolve(t + n);
		vl(e, r.node(), r.before(), s);
	}
	o.inlineContent && sl(e, t + n - 1, o, a.node().contentMatchAt(a.index()), r == null);
	let c = e.mapping.slice(s), l = c.map(t - n);
	if (e.step(new nl(l, c.map(t + n, -1), P.empty, !0)), r === !0) {
		let t = e.doc.resolve(l);
		_l(e, t.node(), t.before(), e.steps.length);
	}
	return e;
}
function Ol(e, t, n) {
	let r = e.resolve(t);
	if (r.parent.canReplaceWith(r.index(), r.index(), n)) return t;
	if (r.parentOffset == 0) for (let e = r.depth - 1; e >= 0; e--) {
		let t = r.index(e);
		if (r.node(e).canReplaceWith(t, t, n)) return r.before(e + 1);
		if (t > 0) return null;
	}
	if (r.parentOffset == r.parent.content.size) for (let e = r.depth - 1; e >= 0; e--) {
		let t = r.indexAfter(e);
		if (r.node(e).canReplaceWith(t, t, n)) return r.after(e + 1);
		if (t < r.node(e).childCount) return null;
	}
	return null;
}
function kl(e, t, n) {
	let r = e.resolve(t);
	if (!n.content.size) return t;
	let i = n.content;
	for (let e = 0; e < n.openStart; e++) i = i.firstChild.content;
	for (let e = 1; e <= (n.openStart == 0 && n.size ? 2 : 1); e++) for (let t = r.depth; t >= 0; t--) {
		let n = t == r.depth ? 0 : r.pos <= (r.start(t + 1) + r.end(t + 1)) / 2 ? -1 : 1;
		for (let a = 0; a < 2; a++) {
			if (a) {
				if (!n) break;
				n = -n;
			}
			let o = r.index(t) + +(n > 0), s = r.node(t), c = !1;
			if (e == 1) c = s.canReplace(o, o, i);
			else {
				let e = s.contentMatchAt(o).findWrapping(i.firstChild.type);
				c = e && s.canReplaceWith(o, o, e[0]);
			}
			if (c) return n == 0 ? r.pos : n < 0 ? r.before(t + 1) : r.after(t + 1);
		}
	}
	return null;
}
function Al(e, t, n = t, r = P.empty) {
	if (t == n && !r.size) return null;
	let i = e.resolve(t), a = e.resolve(n);
	return jl(i, a, r) ? new nl(t, n, r) : new Ml(i, a, r).fit();
}
function jl(e, t, n) {
	return !n.openStart && !n.openEnd && e.start() == t.start() && e.parent.canReplace(e.index(), t.index(), n.content);
}
var Ml = class {
	constructor(e, t, n) {
		this.$from = e, this.$to = t, this.unplaced = n, this.frontier = [], this.placed = M.empty;
		for (let t = 0; t <= e.depth; t++) {
			let n = e.node(t);
			this.frontier.push({
				type: n.type,
				match: n.contentMatchAt(e.indexAfter(t))
			});
		}
		for (let t = e.depth; t > 0; t--) this.placed = M.from(e.node(t).copy(this.placed));
	}
	get depth() {
		return this.frontier.length - 1;
	}
	fit() {
		for (; this.unplaced.size;) {
			let e = this.findFittable();
			e ? this.placeNodes(e) : this.openMore() || this.dropNode();
		}
		let e = this.mustMoveInline(), t = this.placed.size - this.depth - this.$from.depth, n = this.$from, r = this.close(e < 0 ? this.$to : n.doc.resolve(e));
		if (!r) return null;
		let i = this.placed, a = n.depth, o = r.depth;
		for (; a && o && i.childCount == 1;) i = i.firstChild.content, a--, o--;
		let s = new P(i, a, o);
		return e > -1 ? new rl(n.pos, e, this.$to.pos, this.$to.end(), s, t) : s.size || n.pos != this.$to.pos ? new nl(n.pos, r.pos, s) : null;
	}
	findFittable() {
		let e = this.unplaced.openStart;
		for (let t = this.unplaced.content, n = 0, r = this.unplaced.openEnd; n < e; n++) {
			let i = t.firstChild;
			if (t.childCount > 1 && (r = 0), i.type.spec.isolating && r <= n) {
				e = n;
				break;
			}
			t = i.content;
		}
		for (let t = 1; t <= 2; t++) for (let n = t == 1 ? e : this.unplaced.openStart; n >= 0; n--) {
			let e, r = null;
			n ? (r = Fl(this.unplaced.content, n - 1).firstChild, e = r.content) : e = this.unplaced.content;
			let i = e.firstChild;
			for (let e = this.depth; e >= 0; e--) {
				let { type: a, match: o } = this.frontier[e], s, c = null;
				if (t == 1 && (i ? o.matchType(i.type) || (c = o.fillBefore(M.from(i), !1)) : r && a.compatibleContent(r.type))) return {
					sliceDepth: n,
					frontierDepth: e,
					parent: r,
					inject: c
				};
				if (t == 2 && i && (s = o.findWrapping(i.type))) return {
					sliceDepth: n,
					frontierDepth: e,
					parent: r,
					wrap: s
				};
				if (r && o.matchType(r.type)) break;
			}
		}
	}
	openMore() {
		let { content: e, openStart: t, openEnd: n } = this.unplaced;
		return Bl(e, -1) <= t ? !1 : (this.unplaced.size > 1 && Bl(e, 1) > n && n++, this.unplaced = new P(e, t + 1, n), !0);
	}
	dropNode() {
		let { content: e, openStart: t, openEnd: n } = this.unplaced, r = Fl(e, t);
		if (r.childCount <= 1 && t > 0) {
			let i = e.size - t <= t + r.size;
			this.unplaced = new P(Nl(e, t - 1, 1), t - 1, i ? t - 1 : n);
		} else this.unplaced = new P(Nl(e, t, 1), t, n);
	}
	placeNodes({ sliceDepth: e, frontierDepth: t, parent: n, inject: r, wrap: i }) {
		for (; this.depth > t;) this.closeFrontierNode();
		if (i) for (let e = 0; e < i.length; e++) this.openFrontierNode(i[e]);
		let a = this.unplaced, o = n ? n.content : a.content, s = a.openStart - e, c = 0, l = [], { match: u, type: d } = this.frontier[t];
		if (r) {
			for (let e = 0; e < r.childCount; e++) l.push(r.child(e));
			u = u.matchFragment(r);
		}
		let f = o.size + e - (a.content.size - a.openEnd);
		for (; c < o.childCount;) {
			let e = o.child(c), t = u.matchType(e.type);
			if (!t) break;
			c++, (c > 1 || s == 0 || e.content.size) && (u = t, l.push(Il(e.mark(d.allowedMarks(e.marks)), c == 1 ? s : 0, c == o.childCount ? f : -1)));
		}
		let p = c == o.childCount;
		p || (f = -1), this.placed = Pl(this.placed, t, M.from(l)), this.frontier[t].match = u, p && f < 0 && n && n.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
		for (let e = 0, t = l[l.length - 1]; t && e < f; e++) this.frontier.push({
			type: t.type,
			match: t.contentMatchAt(t.childCount)
		}), t = t.lastChild;
		this.unplaced = p ? e == 0 ? P.empty : new P(Nl(a.content, e - 1, 1), e - 1, f < 0 ? a.openEnd : e - 1) : new P(Nl(a.content, e, c), e, a.openEnd);
	}
	mustMoveInline() {
		if (!this.$to.parent.isTextblock) return -1;
		let e = this.frontier[this.depth], t;
		if (!e.type.isTextblock || !Ll(this.$to, this.$to.depth, e.type, e.match, !1) || this.$to.depth == this.depth && (t = this.findCloseLevel(this.$to)) && t.depth == this.depth) return -1;
		let { depth: n } = this.$to, r = this.$to.after(n);
		for (; n > 1 && r == this.$to.end(--n);) ++r;
		return r;
	}
	findCloseLevel(e) {
		scan: for (let t = Math.min(this.depth, e.depth); t >= 0; t--) {
			let { match: n, type: r } = this.frontier[t], i = t < e.depth && e.end(t + 1) == e.pos + (e.depth - (t + 1)), a = Ll(e, t, r, n, i);
			if (a) {
				for (let n = t - 1; n >= 0; n--) {
					let { match: t, type: r } = this.frontier[n], i = Ll(e, n, r, t, !0);
					if (!i || i.childCount) continue scan;
				}
				return {
					depth: t,
					fit: a,
					move: i ? e.doc.resolve(e.after(t + 1)) : e
				};
			}
		}
	}
	close(e) {
		let t = this.findCloseLevel(e);
		if (!t) return null;
		for (; this.depth > t.depth;) this.closeFrontierNode();
		t.fit.childCount && (this.placed = Pl(this.placed, t.depth, t.fit)), e = t.move;
		for (let n = t.depth + 1; n <= e.depth; n++) {
			let t = e.node(n), r = t.type.contentMatch.fillBefore(t.content, !0, e.index(n));
			this.openFrontierNode(t.type, t.attrs, r);
		}
		return e;
	}
	openFrontierNode(e, t = null, n) {
		let r = this.frontier[this.depth];
		r.match = r.match.matchType(e), this.placed = Pl(this.placed, this.depth, M.from(e.create(t, n))), this.frontier.push({
			type: e,
			match: e.contentMatch
		});
	}
	closeFrontierNode() {
		let e = this.frontier.pop().match.fillBefore(M.empty, !0);
		e.childCount && (this.placed = Pl(this.placed, this.frontier.length, e));
	}
};
function Nl(e, t, n) {
	return t == 0 ? e.cutByIndex(n, e.childCount) : e.replaceChild(0, e.firstChild.copy(Nl(e.firstChild.content, t - 1, n)));
}
function Pl(e, t, n) {
	return t == 0 ? e.append(n) : e.replaceChild(e.childCount - 1, e.lastChild.copy(Pl(e.lastChild.content, t - 1, n)));
}
function Fl(e, t) {
	for (let n = 0; n < t; n++) e = e.firstChild.content;
	return e;
}
function Il(e, t, n) {
	if (t <= 0) return e;
	let r = e.content;
	return t > 1 && (r = r.replaceChild(0, Il(r.firstChild, t - 1, r.childCount == 1 ? n - 1 : 0))), t > 0 && (r = e.type.contentMatch.fillBefore(r).append(r), n <= 0 && (r = r.append(e.type.contentMatch.matchFragment(r).fillBefore(M.empty, !0)))), e.copy(r);
}
function Ll(e, t, n, r, i) {
	let a = e.node(t), o = i ? e.indexAfter(t) : e.index(t);
	if (o == a.childCount && !n.compatibleContent(a.type)) return null;
	let s = r.fillBefore(a.content, !0, o);
	return s && !Rl(n, a.content, o) ? s : null;
}
function Rl(e, t, n) {
	for (let r = n; r < t.childCount; r++) if (!e.allowsMarks(t.child(r).marks)) return !0;
	return !1;
}
function zl(e) {
	return e.spec.defining || e.spec.definingForContent;
}
function Bl(e, t) {
	for (let n = 0;; n++) {
		let r = t < 0 ? e.firstChild : e.lastChild;
		if (!r || r.isAtom) return n;
		e = r.content;
	}
}
function Vl(e, t, n, r) {
	if (!r.size) return e.deleteRange(t, n);
	let i = e.doc.resolve(t), a = e.doc.resolve(n);
	if (jl(i, a, r)) return e.step(new nl(t, n, r));
	let o = Gl(i, a);
	o[o.length - 1] == 0 && o.pop();
	let s = -(i.depth + 1);
	o.unshift(s);
	for (let e = i.depth, t = i.pos - 1; e > 0; e--, t--) {
		let n = i.node(e).type.spec;
		if (n.defining || n.definingAsContext || n.isolating) break;
		o.indexOf(e) > -1 ? s = e : i.before(e) == t && o.splice(1, 0, -e);
	}
	let c = o.indexOf(s), l = [], u = r.openStart;
	for (let e = r.content, t = 0;; t++) {
		let n = e.firstChild;
		if (l.push(n), t == r.openStart) break;
		e = n.content;
	}
	for (let e = u - 1; e >= 0; e--) {
		let t = l[e], n = zl(t.type);
		if (n && !t.sameMarkup(i.node(Math.abs(s) - 1))) u = e;
		else if (n || !t.type.isTextblock) break;
	}
	for (let t = r.openStart; t >= 0; t--) {
		let s = (t + u + 1) % (r.openStart + 1), d = l[s];
		if (d) for (let t = 0; t < o.length; t++) {
			let l = o[(t + c) % o.length], u = !0;
			l < 0 && (u = !1, l = -l);
			let f = i.node(l - 1), p = i.index(l - 1);
			if (f.canReplaceWith(p, p, d.type, d.marks)) return e.replace(i.before(l), u ? a.after(l) : n, new P(Hl(r.content, 0, r.openStart, s), s, r.openEnd));
		}
	}
	let d = e.steps.length;
	for (let s = o.length - 1; s >= 0 && (e.replace(t, n, r), !(e.steps.length > d)); s--) {
		let e = o[s];
		e < 0 || (t = i.before(e), n = a.after(e));
	}
}
function Hl(e, t, n, r, i) {
	if (t < n) {
		let i = e.firstChild;
		e = e.replaceChild(0, i.copy(Hl(i.content, t + 1, n, r, i)));
	}
	if (t > r) {
		let t = i.contentMatchAt(0), n = t.fillBefore(e).append(e);
		e = n.append(t.matchFragment(n).fillBefore(M.empty, !0));
	}
	return e;
}
function Ul(e, t, n, r) {
	if (!r.isInline && t == n && e.doc.resolve(t).parent.content.size) {
		let i = Ol(e.doc, t, r.type);
		i != null && (t = n = i);
	}
	e.replaceRange(t, n, new P(M.from(r), 0, 0));
}
function Wl(e, t, n) {
	let r = e.doc.resolve(t), i = e.doc.resolve(n);
	if (r.parent.isTextblock && i.parent.isTextblock && r.start() != i.start() && r.parentOffset == 0 && i.parentOffset == 0) {
		let a = r.sharedDepth(n), o = !1;
		for (let e = r.depth; e > a; e--) r.node(e).type.spec.isolating && (o = !0);
		for (let e = i.depth; e > a; e--) i.node(e).type.spec.isolating && (o = !0);
		if (!o) {
			for (let e = r.depth; e > 0 && t == r.start(e); e--) t = r.before(e);
			for (let e = i.depth; e > 0 && n == i.start(e); e--) n = i.before(e);
			r = e.doc.resolve(t), i = e.doc.resolve(n);
		}
	}
	let a = Gl(r, i);
	for (let t = 0; t < a.length; t++) {
		let n = a[t], o = t == a.length - 1;
		if (o && n == 0 || r.node(n).type.contentMatch.validEnd) return e.delete(r.start(n), i.end(n));
		if (n > 0 && (o || r.node(n - 1).canReplace(r.index(n - 1), i.indexAfter(n - 1)))) return e.delete(r.before(n), i.after(n));
	}
	for (let a = 1; a <= r.depth && a <= i.depth; a++) if (t - r.start(a) == r.depth - a && n > r.end(a) && i.end(a) - n != i.depth - a && r.start(a - 1) == i.start(a - 1) && r.node(a - 1).canReplace(r.index(a - 1), i.index(a - 1))) return e.delete(r.before(a), n);
	e.delete(t, n);
}
function Gl(e, t) {
	let n = [], r = Math.min(e.depth, t.depth);
	for (let i = r; i >= 0; i--) {
		let r = e.start(i);
		if (r < e.pos - (e.depth - i) || t.end(i) > t.pos + (t.depth - i) || e.node(i).type.spec.isolating || t.node(i).type.spec.isolating) break;
		(r == t.start(i) || i == e.depth && i == t.depth && e.parent.inlineContent && t.parent.inlineContent && i && t.start(i - 1) == r - 1) && n.push(i);
	}
	return n;
}
var Kl = class e extends F {
	constructor(e, t, n) {
		super(), this.pos = e, this.attr = t, this.value = n;
	}
	apply(e) {
		let t = e.nodeAt(this.pos);
		if (!t) return Jc.fail("No node at attribute step's position");
		let n = Object.create(null);
		for (let e in t.attrs) n[e] = t.attrs[e];
		n[this.attr] = this.value;
		let r = t.type.create(n, null, t.marks);
		return Jc.fromReplace(e, this.pos, this.pos + 1, new P(M.from(r), 0, +!t.isLeaf));
	}
	getMap() {
		return Gc.empty;
	}
	invert(t) {
		return new e(this.pos, this.attr, t.nodeAt(this.pos).attrs[this.attr]);
	}
	map(t) {
		let n = t.mapResult(this.pos, 1);
		return n.deletedAfter ? null : new e(n.pos, this.attr, this.value);
	}
	toJSON() {
		return {
			stepType: "attr",
			pos: this.pos,
			attr: this.attr,
			value: this.value
		};
	}
	static fromJSON(t, n) {
		if (typeof n.pos != "number" || typeof n.attr != "string") throw RangeError("Invalid input for AttrStep.fromJSON");
		return new e(n.pos, n.attr, n.value);
	}
};
F.jsonID("attr", Kl);
var ql = class e extends F {
	constructor(e, t) {
		super(), this.attr = e, this.value = t;
	}
	apply(e) {
		let t = Object.create(null);
		for (let n in e.attrs) t[n] = e.attrs[n];
		t[this.attr] = this.value;
		let n = e.type.create(t, e.content, e.marks);
		return Jc.ok(n);
	}
	getMap() {
		return Gc.empty;
	}
	invert(t) {
		return new e(this.attr, t.attrs[this.attr]);
	}
	map(e) {
		return this;
	}
	toJSON() {
		return {
			stepType: "docAttr",
			attr: this.attr,
			value: this.value
		};
	}
	static fromJSON(t, n) {
		if (typeof n.attr != "string") throw RangeError("Invalid input for DocAttrStep.fromJSON");
		return new e(n.attr, n.value);
	}
};
F.jsonID("docAttr", ql);
var Jl = class extends Error {};
Jl = function e(t) {
	let n = Error.call(this, t);
	return n.__proto__ = e.prototype, n;
}, Jl.prototype = Object.create(Error.prototype), Jl.prototype.constructor = Jl, Jl.prototype.name = "TransformError";
var Yl = class {
	constructor(e) {
		this.doc = e, this.steps = [], this.docs = [], this.mapping = new Kc();
	}
	get before() {
		return this.docs.length ? this.docs[0] : this.doc;
	}
	step(e) {
		let t = this.maybeStep(e);
		if (t.failed) throw new Jl(t.failed);
		return this;
	}
	maybeStep(e) {
		let t = e.apply(this.doc);
		return t.failed || this.addStep(e, t.doc), t;
	}
	get docChanged() {
		return this.steps.length > 0;
	}
	changedRange() {
		let e = 1e9, t = -1e9;
		for (let n = 0; n < this.mapping.maps.length; n++) {
			let r = this.mapping.maps[n];
			n && (e = r.map(e, 1), t = r.map(t, -1)), r.forEach((n, r, i, a) => {
				e = Math.min(e, i), t = Math.max(t, a);
			});
		}
		return e == 1e9 ? null : {
			from: e,
			to: t
		};
	}
	addStep(e, t) {
		this.docs.push(this.doc), this.steps.push(e), this.mapping.appendMap(e.getMap()), this.doc = t;
	}
	replace(e, t = e, n = P.empty) {
		let r = Al(this.doc, e, t, n);
		return r && this.step(r), this;
	}
	replaceWith(e, t, n) {
		return this.replace(e, t, new P(M.from(n), 0, 0));
	}
	delete(e, t) {
		return this.replace(e, t, P.empty);
	}
	insert(e, t) {
		return this.replaceWith(e, e, t);
	}
	replaceRange(e, t, n) {
		return Vl(this, e, t, n), this;
	}
	replaceRangeWith(e, t, n) {
		return Ul(this, e, t, n), this;
	}
	deleteRange(e, t) {
		return Wl(this, e, t), this;
	}
	lift(e, t) {
		return ul(this, e, t), this;
	}
	join(e, t = 1) {
		return Dl(this, e, t), this;
	}
	wrap(e, t) {
		return hl(this, e, t), this;
	}
	setBlockType(e, t = e, n, r = null) {
		return gl(this, e, t, n, r), this;
	}
	setNodeMarkup(e, t, n = null, r) {
		return bl(this, e, t, n, r), this;
	}
	setNodeAttribute(e, t, n) {
		return this.step(new Kl(e, t, n)), this;
	}
	setDocAttribute(e, t) {
		return this.step(new ql(e, t)), this;
	}
	addNodeMark(e, t) {
		return this.step(new el(e, t)), this;
	}
	removeNodeMark(e, t) {
		let n = this.doc.nodeAt(e);
		if (!n) throw RangeError("No node at position " + e);
		if (t instanceof N) t.isInSet(n.marks) && this.step(new tl(e, t));
		else {
			let r = n.marks, i, a = [];
			for (; i = t.isInSet(r);) a.push(new tl(e, i)), r = i.removeFromSet(r);
			for (let e = a.length - 1; e >= 0; e--) this.step(a[e]);
		}
		return this;
	}
	split(e, t = 1, n) {
		return Sl(this, e, t, n), this;
	}
	addMark(e, t, n) {
		return al(this, e, t, n), this;
	}
	removeMark(e, t, n) {
		return ol(this, e, t, n), this;
	}
	clearIncompatible(e, t, n) {
		return sl(this, e, t, n), this;
	}
}, Xl = Object.create(null), I = class {
	constructor(e, t, n) {
		this.$anchor = e, this.$head = t, this.ranges = n || [new Zl(e.min(t), e.max(t))];
	}
	get anchor() {
		return this.$anchor.pos;
	}
	get head() {
		return this.$head.pos;
	}
	get from() {
		return this.$from.pos;
	}
	get to() {
		return this.$to.pos;
	}
	get $from() {
		return this.ranges[0].$from;
	}
	get $to() {
		return this.ranges[0].$to;
	}
	get empty() {
		let e = this.ranges;
		for (let t = 0; t < e.length; t++) if (e[t].$from.pos != e[t].$to.pos) return !1;
		return !0;
	}
	content() {
		return this.$from.doc.slice(this.from, this.to, !0);
	}
	replace(e, t = P.empty) {
		let n = t.content.lastChild, r = null;
		for (let e = 0; e < t.openEnd; e++) r = n, n = n.lastChild;
		let i = e.steps.length, a = this.ranges;
		for (let o = 0; o < a.length; o++) {
			let { $from: s, $to: c } = a[o], l = e.mapping.slice(i);
			e.replaceRange(l.map(s.pos), l.map(c.pos), o ? P.empty : t), o == 0 && au(e, i, (n ? n.isInline : r && r.isTextblock) ? -1 : 1);
		}
	}
	replaceWith(e, t) {
		let n = e.steps.length, r = this.ranges;
		for (let i = 0; i < r.length; i++) {
			let { $from: a, $to: o } = r[i], s = e.mapping.slice(n), c = s.map(a.pos), l = s.map(o.pos);
			i ? e.deleteRange(c, l) : (e.replaceRangeWith(c, l, t), au(e, n, t.isInline ? -1 : 1));
		}
	}
	static findFrom(e, t, n = !1) {
		let r = e.parent.inlineContent ? new L(e) : iu(e.node(0), e.parent, e.pos, e.index(), t, n);
		if (r) return r;
		for (let r = e.depth - 1; r >= 0; r--) {
			let i = t < 0 ? iu(e.node(0), e.node(r), e.before(r + 1), e.index(r), t, n) : iu(e.node(0), e.node(r), e.after(r + 1), e.index(r) + 1, t, n);
			if (i) return i;
		}
		return null;
	}
	static near(e, t = 1) {
		return this.findFrom(e, t) || this.findFrom(e, -t) || new nu(e.node(0));
	}
	static atStart(e) {
		return iu(e, e, 0, 0, 1) || new nu(e);
	}
	static atEnd(e) {
		return iu(e, e, e.content.size, e.childCount, -1) || new nu(e);
	}
	static fromJSON(e, t) {
		if (!t || !t.type) throw RangeError("Invalid input for Selection.fromJSON");
		let n = Xl[t.type];
		if (!n) throw RangeError(`No selection type ${t.type} defined`);
		return n.fromJSON(e, t);
	}
	static jsonID(e, t) {
		if (e in Xl) throw RangeError("Duplicate use of selection JSON ID " + e);
		return Xl[e] = t, t.prototype.jsonID = e, t;
	}
	getBookmark() {
		return L.between(this.$anchor, this.$head).getBookmark();
	}
};
I.prototype.visible = !0;
var Zl = class {
	constructor(e, t) {
		this.$from = e, this.$to = t;
	}
}, Ql = !1;
function $l(e) {
	!Ql && !e.parent.inlineContent && (Ql = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + e.parent.type.name + ")"));
}
var L = class e extends I {
	constructor(e, t = e) {
		$l(e), $l(t), super(e, t);
	}
	get $cursor() {
		return this.$anchor.pos == this.$head.pos ? this.$head : null;
	}
	map(t, n) {
		let r = t.resolve(n.map(this.head));
		if (!r.parent.inlineContent) return I.near(r);
		let i = t.resolve(n.map(this.anchor));
		return new e(i.parent.inlineContent ? i : r, r);
	}
	replace(e, t = P.empty) {
		if (super.replace(e, t), t == P.empty) {
			let t = this.$from.marksAcross(this.$to);
			t && e.ensureMarks(t);
		}
	}
	eq(t) {
		return t instanceof e && t.anchor == this.anchor && t.head == this.head;
	}
	getBookmark() {
		return new eu(this.anchor, this.head);
	}
	toJSON() {
		return {
			type: "text",
			anchor: this.anchor,
			head: this.head
		};
	}
	static fromJSON(t, n) {
		if (typeof n.anchor != "number" || typeof n.head != "number") throw RangeError("Invalid input for TextSelection.fromJSON");
		return new e(t.resolve(n.anchor), t.resolve(n.head));
	}
	static create(e, t, n = t) {
		let r = e.resolve(t);
		return new this(r, n == t ? r : e.resolve(n));
	}
	static between(t, n, r) {
		let i = t.pos - n.pos;
		if ((!r || i) && (r = i >= 0 ? 1 : -1), !n.parent.inlineContent) {
			let e = I.findFrom(n, r, !0) || I.findFrom(n, -r, !0);
			if (e) n = e.$head;
			else return I.near(n, r);
		}
		return t.parent.inlineContent || (i == 0 ? t = n : (t = (I.findFrom(t, -r, !0) || I.findFrom(t, r, !0)).$anchor, t.pos < n.pos != i < 0 && (t = n))), new e(t, n);
	}
};
I.jsonID("text", L);
var eu = class e {
	constructor(e, t) {
		this.anchor = e, this.head = t;
	}
	map(t) {
		return new e(t.map(this.anchor), t.map(this.head));
	}
	resolve(e) {
		return L.between(e.resolve(this.anchor), e.resolve(this.head));
	}
}, R = class e extends I {
	constructor(e) {
		let t = e.nodeAfter, n = e.node(0).resolve(e.pos + t.nodeSize);
		super(e, n), this.node = t;
	}
	map(t, n) {
		let { deleted: r, pos: i } = n.mapResult(this.anchor), a = t.resolve(i);
		return r ? I.near(a) : new e(a);
	}
	content() {
		return new P(M.from(this.node), 0, 0);
	}
	eq(t) {
		return t instanceof e && t.anchor == this.anchor;
	}
	toJSON() {
		return {
			type: "node",
			anchor: this.anchor
		};
	}
	getBookmark() {
		return new tu(this.anchor);
	}
	static fromJSON(t, n) {
		if (typeof n.anchor != "number") throw RangeError("Invalid input for NodeSelection.fromJSON");
		return new e(t.resolve(n.anchor));
	}
	static create(t, n) {
		return new e(t.resolve(n));
	}
	static isSelectable(e) {
		return !e.isText && e.type.spec.selectable !== !1;
	}
};
R.prototype.visible = !1, I.jsonID("node", R);
var tu = class e {
	constructor(e) {
		this.anchor = e;
	}
	map(t) {
		let { deleted: n, pos: r } = t.mapResult(this.anchor);
		return n ? new eu(r, r) : new e(r);
	}
	resolve(e) {
		let t = e.resolve(this.anchor), n = t.nodeAfter;
		return n && R.isSelectable(n) ? new R(t) : I.near(t);
	}
}, nu = class e extends I {
	constructor(e) {
		super(e.resolve(0), e.resolve(e.content.size));
	}
	replace(e, t = P.empty) {
		if (t == P.empty) {
			e.delete(0, e.doc.content.size);
			let t = I.atStart(e.doc);
			t.eq(e.selection) || e.setSelection(t);
		} else super.replace(e, t);
	}
	toJSON() {
		return { type: "all" };
	}
	static fromJSON(t) {
		return new e(t);
	}
	map(t) {
		return new e(t);
	}
	eq(t) {
		return t instanceof e;
	}
	getBookmark() {
		return ru;
	}
};
I.jsonID("all", nu);
var ru = {
	map() {
		return this;
	},
	resolve(e) {
		return new nu(e);
	}
};
function iu(e, t, n, r, i, a = !1) {
	if (t.inlineContent) return L.create(e, n);
	for (let o = r - (i > 0 ? 0 : 1); i > 0 ? o < t.childCount : o >= 0; o += i) {
		let r = t.child(o);
		if (!r.isAtom) {
			let t = iu(e, r, n + i, i < 0 ? r.childCount : 0, i, a);
			if (t) return t;
		} else if (!a && R.isSelectable(r)) return R.create(e, n - (i < 0 ? r.nodeSize : 0));
		n += r.nodeSize * i;
	}
	return null;
}
function au(e, t, n) {
	let r = e.steps.length - 1;
	if (r < t) return;
	let i = e.steps[r];
	if (!(i instanceof nl || i instanceof rl)) return;
	let a = e.mapping.maps[r], o;
	a.forEach((e, t, n, r) => {
		o ??= r;
	}), e.setSelection(I.near(e.doc.resolve(o), n));
}
var ou = 1, su = 2, cu = 4, lu = class extends Yl {
	constructor(e) {
		super(e.doc), this.curSelectionFor = 0, this.updated = 0, this.meta = Object.create(null), this.time = Date.now(), this.curSelection = e.selection, this.storedMarks = e.storedMarks;
	}
	get selection() {
		return this.curSelectionFor < this.steps.length && (this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor)), this.curSelectionFor = this.steps.length), this.curSelection;
	}
	setSelection(e) {
		if (e.$from.doc != this.doc) throw RangeError("Selection passed to setSelection must point at the current document");
		return this.curSelection = e, this.curSelectionFor = this.steps.length, this.updated = (this.updated | ou) & -3, this.storedMarks = null, this;
	}
	get selectionSet() {
		return (this.updated & ou) > 0;
	}
	setStoredMarks(e) {
		return this.storedMarks = e, this.updated |= su, this;
	}
	ensureMarks(e) {
		return N.sameSet(this.storedMarks || this.selection.$from.marks(), e) || this.setStoredMarks(e), this;
	}
	addStoredMark(e) {
		return this.ensureMarks(e.addToSet(this.storedMarks || this.selection.$head.marks()));
	}
	removeStoredMark(e) {
		return this.ensureMarks(e.removeFromSet(this.storedMarks || this.selection.$head.marks()));
	}
	get storedMarksSet() {
		return (this.updated & su) > 0;
	}
	addStep(e, t) {
		super.addStep(e, t), this.updated &= -3, this.storedMarks = null;
	}
	setTime(e) {
		return this.time = e, this;
	}
	replaceSelection(e) {
		return this.selection.replace(this, e), this;
	}
	replaceSelectionWith(e, t = !0) {
		let n = this.selection;
		return t && (e = e.mark(this.storedMarks || (n.empty ? n.$from.marks() : n.$from.marksAcross(n.$to) || N.none))), n.replaceWith(this, e), this;
	}
	deleteSelection() {
		return this.selection.replace(this), this;
	}
	insertText(e, t, n) {
		let r = this.doc.type.schema;
		if (t == null) return e ? this.replaceSelectionWith(r.text(e), !0) : this.deleteSelection();
		{
			if (n ??= t, !e) return this.deleteRange(t, n);
			let i = this.storedMarks;
			if (!i) {
				let e = this.doc.resolve(t);
				i = n == t ? e.marks() : e.marksAcross(this.doc.resolve(n));
			}
			return this.replaceRangeWith(t, n, r.text(e, i)), !this.selection.empty && this.selection.to == t + e.length && this.setSelection(I.near(this.selection.$to)), this;
		}
	}
	setMeta(e, t) {
		return this.meta[typeof e == "string" ? e : e.key] = t, this;
	}
	getMeta(e) {
		return this.meta[typeof e == "string" ? e : e.key];
	}
	get isGeneric() {
		for (let e in this.meta) return !1;
		return !0;
	}
	scrollIntoView() {
		return this.updated |= cu, this;
	}
	get scrolledIntoView() {
		return (this.updated & cu) > 0;
	}
};
function uu(e, t) {
	return !t || !e ? e : e.bind(t);
}
var du = class {
	constructor(e, t, n) {
		this.name = e, this.init = uu(t.init, n), this.apply = uu(t.apply, n);
	}
}, fu = [
	new du("doc", {
		init(e) {
			return e.doc || e.schema.topNodeType.createAndFill();
		},
		apply(e) {
			return e.doc;
		}
	}),
	new du("selection", {
		init(e, t) {
			return e.selection || I.atStart(t.doc);
		},
		apply(e) {
			return e.selection;
		}
	}),
	new du("storedMarks", {
		init(e) {
			return e.storedMarks || null;
		},
		apply(e, t, n, r) {
			return r.selection.$cursor ? e.storedMarks : null;
		}
	}),
	new du("scrollToSelection", {
		init() {
			return 0;
		},
		apply(e, t) {
			return e.scrolledIntoView ? t + 1 : t;
		}
	})
], pu = class {
	constructor(e, t) {
		this.schema = e, this.plugins = [], this.pluginsByKey = Object.create(null), this.fields = fu.slice(), t && t.forEach((e) => {
			if (this.pluginsByKey[e.key]) throw RangeError("Adding different instances of a keyed plugin (" + e.key + ")");
			this.plugins.push(e), this.pluginsByKey[e.key] = e, e.spec.state && this.fields.push(new du(e.key, e.spec.state, e));
		});
	}
}, mu = class e {
	constructor(e) {
		this.config = e;
	}
	get schema() {
		return this.config.schema;
	}
	get plugins() {
		return this.config.plugins;
	}
	apply(e) {
		return this.applyTransaction(e).state;
	}
	filterTransaction(e, t = -1) {
		for (let n = 0; n < this.config.plugins.length; n++) if (n != t) {
			let t = this.config.plugins[n];
			if (t.spec.filterTransaction && !t.spec.filterTransaction.call(t, e, this)) return !1;
		}
		return !0;
	}
	applyTransaction(e) {
		if (!this.filterTransaction(e)) return {
			state: this,
			transactions: []
		};
		let t = [e], n = this.applyInner(e), r = null;
		for (;;) {
			let i = !1;
			for (let a = 0; a < this.config.plugins.length; a++) {
				let o = this.config.plugins[a];
				if (o.spec.appendTransaction) {
					let s = r ? r[a].n : 0, c = r ? r[a].state : this, l = s < t.length && o.spec.appendTransaction.call(o, s ? t.slice(s) : t, c, n);
					if (l && n.filterTransaction(l, a)) {
						if (l.setMeta("appendedTransaction", e), !r) {
							r = [];
							for (let e = 0; e < this.config.plugins.length; e++) r.push(e < a ? {
								state: n,
								n: t.length
							} : {
								state: this,
								n: 0
							});
						}
						t.push(l), n = n.applyInner(l), i = !0;
					}
					r && (r[a] = {
						state: n,
						n: t.length
					});
				}
			}
			if (!i) return {
				state: n,
				transactions: t
			};
		}
	}
	applyInner(t) {
		if (!t.before.eq(this.doc)) throw RangeError("Applying a mismatched transaction");
		let n = new e(this.config), r = this.config.fields;
		for (let e = 0; e < r.length; e++) {
			let i = r[e];
			n[i.name] = i.apply(t, this[i.name], this, n);
		}
		return n;
	}
	get tr() {
		return new lu(this);
	}
	static create(t) {
		let n = new pu(t.doc ? t.doc.type.schema : t.schema, t.plugins), r = new e(n);
		for (let e = 0; e < n.fields.length; e++) r[n.fields[e].name] = n.fields[e].init(t, r);
		return r;
	}
	reconfigure(t) {
		let n = new pu(this.schema, t.plugins), r = n.fields, i = new e(n);
		for (let e = 0; e < r.length; e++) {
			let n = r[e].name;
			i[n] = this.hasOwnProperty(n) ? this[n] : r[e].init(t, i);
		}
		return i;
	}
	toJSON(e) {
		let t = {
			doc: this.doc.toJSON(),
			selection: this.selection.toJSON()
		};
		if (this.storedMarks && (t.storedMarks = this.storedMarks.map((e) => e.toJSON())), e && typeof e == "object") for (let n in e) {
			if (n == "doc" || n == "selection") throw RangeError("The JSON fields `doc` and `selection` are reserved");
			let r = e[n], i = r.spec.state;
			i && i.toJSON && (t[n] = i.toJSON.call(r, this[r.key]));
		}
		return t;
	}
	static fromJSON(t, n, r) {
		if (!n) throw RangeError("Invalid input for EditorState.fromJSON");
		if (!t.schema) throw RangeError("Required config field 'schema' missing");
		let i = new pu(t.schema, t.plugins), a = new e(i);
		return i.fields.forEach((e) => {
			if (e.name == "doc") a.doc = Rs.fromJSON(t.schema, n.doc);
			else if (e.name == "selection") a.selection = I.fromJSON(a.doc, n.selection);
			else if (e.name == "storedMarks") n.storedMarks && (a.storedMarks = n.storedMarks.map(t.schema.markFromJSON));
			else {
				if (r) for (let i in r) {
					let o = r[i], s = o.spec.state;
					if (o.key == e.name && s && s.fromJSON && Object.prototype.hasOwnProperty.call(n, i)) {
						a[e.name] = s.fromJSON.call(o, t, n[i], a);
						return;
					}
				}
				a[e.name] = e.init(t, a);
			}
		}), a;
	}
};
function hu(e, t, n) {
	for (let r in e) {
		let i = e[r];
		i instanceof Function ? i = i.bind(t) : r == "handleDOMEvents" && (i = hu(i, t, {})), n[r] = i;
	}
	return n;
}
var z = class {
	constructor(e) {
		this.spec = e, this.props = {}, e.props && hu(e.props, this, this.props), this.key = e.key ? e.key.key : _u("plugin");
	}
	getState(e) {
		return e[this.key];
	}
}, gu = Object.create(null);
function _u(e) {
	return e in gu ? e + "$" + ++gu[e] : (gu[e] = 0, e + "$");
}
var B = class {
	constructor(e = "key") {
		this.key = _u(e);
	}
	get(e) {
		return e.config.pluginsByKey[this.key];
	}
	getState(e) {
		return e[this.key];
	}
}, vu = (e, t) => !e.selection.empty && (t && t(e.tr.deleteSelection().scrollIntoView()), !0);
function yu(e, t) {
	let { $cursor: n } = e.selection;
	return !n || (t ? !t.endOfTextblock("backward", e) : n.parentOffset > 0) ? null : n;
}
var bu = (e, t, n) => {
	let r = yu(e, n);
	if (!r) return !1;
	let i = Eu(r);
	if (!i) {
		let n = r.blockRange(), i = n && ll(n);
		return i != null && (t && t(e.tr.lift(n, i).scrollIntoView()), !0);
	}
	let a = i.nodeBefore;
	if (Wu(e, i, t, -1)) return !0;
	if (r.parent.content.size == 0 && (wu(a, "end") || R.isSelectable(a))) for (let n = r.depth;; n--) {
		let o = Al(e.doc, r.before(n), r.after(n), P.empty);
		if (o && o.slice.size < o.to - o.from) {
			if (t) {
				let n = e.tr.step(o);
				n.setSelection(wu(a, "end") ? I.findFrom(n.doc.resolve(n.mapping.map(i.pos, -1)), -1) : R.create(n.doc, i.pos - a.nodeSize)), t(n.scrollIntoView());
			}
			return !0;
		}
		if (n == 1 || r.node(n - 1).childCount > 1) break;
	}
	return a.isAtom && i.depth == r.depth - 1 ? (t && t(e.tr.delete(i.pos - a.nodeSize, i.pos).scrollIntoView()), !0) : !1;
}, xu = (e, t, n) => {
	let r = yu(e, n);
	if (!r) return !1;
	let i = Eu(r);
	return i ? Cu(e, i, t) : !1;
}, Su = (e, t, n) => {
	let r = Du(e, n);
	if (!r) return !1;
	let i = Au(r);
	return i ? Cu(e, i, t) : !1;
};
function Cu(e, t, n) {
	let r = t.nodeBefore, i = t.pos - 1;
	for (; !r.isTextblock; i--) {
		if (r.type.spec.isolating) return !1;
		let e = r.lastChild;
		if (!e) return !1;
		r = e;
	}
	let a = t.nodeAfter, o = t.pos + 1;
	for (; !a.isTextblock; o++) {
		if (a.type.spec.isolating) return !1;
		let e = a.firstChild;
		if (!e) return !1;
		a = e;
	}
	let s = Al(e.doc, i, o, P.empty);
	if (!s || s.from != i || s instanceof nl && s.slice.size >= o - i) return !1;
	if (n) {
		let t = e.tr.step(s);
		t.setSelection(L.create(t.doc, i)), n(t.scrollIntoView());
	}
	return !0;
}
function wu(e, t, n = !1) {
	for (let r = e; r; r = t == "start" ? r.firstChild : r.lastChild) {
		if (r.isTextblock) return !0;
		if (n && r.childCount != 1) return !1;
	}
	return !1;
}
var Tu = (e, t, n) => {
	let { $head: r, empty: i } = e.selection, a = r;
	if (!i) return !1;
	if (r.parent.isTextblock) {
		if (n ? !n.endOfTextblock("backward", e) : r.parentOffset > 0) return !1;
		a = Eu(r);
	}
	let o = a && a.nodeBefore;
	return !o || !R.isSelectable(o) ? !1 : (t && t(e.tr.setSelection(R.create(e.doc, a.pos - o.nodeSize)).scrollIntoView()), !0);
};
function Eu(e) {
	if (!e.parent.type.spec.isolating) for (let t = e.depth - 1; t >= 0; t--) {
		if (e.index(t) > 0) return e.doc.resolve(e.before(t + 1));
		if (e.node(t).type.spec.isolating) break;
	}
	return null;
}
function Du(e, t) {
	let { $cursor: n } = e.selection;
	return !n || (t ? !t.endOfTextblock("forward", e) : n.parentOffset < n.parent.content.size) ? null : n;
}
var Ou = (e, t, n) => {
	let r = Du(e, n);
	if (!r) return !1;
	let i = Au(r);
	if (!i) return !1;
	let a = i.nodeAfter;
	if (Wu(e, i, t, 1)) return !0;
	if (r.parent.content.size == 0 && (wu(a, "start") || R.isSelectable(a))) {
		let n = Al(e.doc, r.before(), r.after(), P.empty);
		if (n && n.slice.size < n.to - n.from) {
			if (t) {
				let r = e.tr.step(n);
				r.setSelection(wu(a, "start") ? I.findFrom(r.doc.resolve(r.mapping.map(i.pos)), 1) : R.create(r.doc, r.mapping.map(i.pos))), t(r.scrollIntoView());
			}
			return !0;
		}
	}
	return a.isAtom && i.depth == r.depth - 1 ? (t && t(e.tr.delete(i.pos, i.pos + a.nodeSize).scrollIntoView()), !0) : !1;
}, ku = (e, t, n) => {
	let { $head: r, empty: i } = e.selection, a = r;
	if (!i) return !1;
	if (r.parent.isTextblock) {
		if (n ? !n.endOfTextblock("forward", e) : r.parentOffset < r.parent.content.size) return !1;
		a = Au(r);
	}
	let o = a && a.nodeAfter;
	return !o || !R.isSelectable(o) ? !1 : (t && t(e.tr.setSelection(R.create(e.doc, a.pos)).scrollIntoView()), !0);
};
function Au(e) {
	if (!e.parent.type.spec.isolating) for (let t = e.depth - 1; t >= 0; t--) {
		let n = e.node(t);
		if (e.index(t) + 1 < n.childCount) return e.doc.resolve(e.after(t + 1));
		if (n.type.spec.isolating) break;
	}
	return null;
}
var ju = (e, t) => {
	let n = e.selection, r = n instanceof R, i;
	if (r) {
		if (n.node.isTextblock || !Cl(e.doc, n.from)) return !1;
		i = n.from;
	} else if (i = El(e.doc, n.from, -1), i == null) return !1;
	if (t) {
		let n = e.tr.join(i);
		r && n.setSelection(R.create(n.doc, i - e.doc.resolve(i).nodeBefore.nodeSize)), t(n.scrollIntoView());
	}
	return !0;
}, Mu = (e, t) => {
	let n = e.selection, r;
	if (n instanceof R) {
		if (n.node.isTextblock || !Cl(e.doc, n.to)) return !1;
		r = n.to;
	} else if (r = El(e.doc, n.to, 1), r == null) return !1;
	return t && t(e.tr.join(r).scrollIntoView()), !0;
}, Nu = (e, t) => {
	let { $from: n, $to: r } = e.selection, i = n.blockRange(r), a = i && ll(i);
	return a != null && (t && t(e.tr.lift(i, a).scrollIntoView()), !0);
}, Pu = (e, t) => {
	let { $head: n, $anchor: r } = e.selection;
	return !n.parent.type.spec.code || !n.sameParent(r) ? !1 : (t && t(e.tr.insertText("\n").scrollIntoView()), !0);
};
function Fu(e) {
	for (let t = 0; t < e.edgeCount; t++) {
		let { type: n } = e.edge(t);
		if (n.isTextblock && !n.hasRequiredAttrs()) return n;
	}
	return null;
}
var Iu = (e, t) => {
	let { $head: n, $anchor: r } = e.selection;
	if (!n.parent.type.spec.code || !n.sameParent(r)) return !1;
	let i = n.node(-1), a = n.indexAfter(-1), o = Fu(i.contentMatchAt(a));
	if (!o || !i.canReplaceWith(a, a, o)) return !1;
	if (t) {
		let r = n.after(), i = e.tr.replaceWith(r, r, o.createAndFill());
		i.setSelection(I.near(i.doc.resolve(r), 1)), t(i.scrollIntoView());
	}
	return !0;
}, Lu = (e, t) => {
	let n = e.selection, { $from: r, $to: i } = n;
	if (n instanceof nu || r.parent.inlineContent || i.parent.inlineContent) return !1;
	let a = Fu(i.parent.contentMatchAt(i.indexAfter()));
	if (!a || !a.isTextblock) return !1;
	if (t) {
		let n = (!r.parentOffset && i.index() < i.parent.childCount ? r : i).pos, o = e.tr.insert(n, a.createAndFill());
		o.setSelection(L.create(o.doc, n + 1)), t(o.scrollIntoView());
	}
	return !0;
}, Ru = (e, t) => {
	let { $cursor: n } = e.selection;
	if (!n || n.parent.content.size) return !1;
	if (n.depth > 1 && n.after() != n.end(-1)) {
		let r = n.before();
		if (xl(e.doc, r)) return t && t(e.tr.split(r).scrollIntoView()), !0;
	}
	let r = n.blockRange(), i = r && ll(r);
	return i != null && (t && t(e.tr.lift(r, i).scrollIntoView()), !0);
};
function zu(e) {
	return (t, n) => {
		if (t.selection instanceof R && t.selection.node.isBlock) {
			let { $from: e } = t.selection;
			return !e.parentOffset || !xl(t.doc, e.pos) ? !1 : (n && n(t.tr.split(e.pos).scrollIntoView()), !0);
		}
		if (!t.selection.$from.depth) return !1;
		let r = t.tr;
		!t.selection.empty && (t.selection instanceof L || t.selection instanceof nu) && r.deleteSelection();
		let { $from: i } = r.selection, a = r.steps.length, o = [], s, c, l = !1, u = !1;
		for (let t = i.depth;; t--) if (i.node(t).isBlock) {
			l = i.end(t) == i.pos + (i.depth - t), u = i.start(t) == i.pos - (i.depth - t), c = Fu(i.node(t - 1).contentMatchAt(i.indexAfter(t - 1)));
			let n = e && e(i.parent, l, i);
			o.unshift(n || (l && c ? { type: c } : null)), s = t;
			break;
		} else {
			if (t == 1) return !1;
			o.unshift(null);
		}
		let d = i.pos, f = xl(r.doc, d, o.length, o);
		if (f ||= (o[0] = c ? { type: c } : null, xl(r.doc, d, o.length, o)), !f) return !1;
		if (r.split(d, o.length, o), !l && u && i.node(s).type != c) {
			let e = r.mapping.slice(a), t = e.map(i.before(s)), n = r.doc.resolve(t);
			c && i.node(s - 1).canReplaceWith(n.index(), n.index() + 1, c) && r.setNodeMarkup(e.map(i.before(s)), c);
		}
		return n && n(r.scrollIntoView()), !0;
	};
}
var Bu = zu(), Vu = (e, t) => {
	let { $from: n, to: r } = e.selection, i, a = n.sharedDepth(r);
	return a != 0 && (i = n.before(a), t && t(e.tr.setSelection(R.create(e.doc, i))), !0);
}, Hu = (e, t) => (t && t(e.tr.setSelection(new nu(e.doc))), !0);
function Uu(e, t, n) {
	let r = t.nodeBefore, i = t.nodeAfter, a = t.index();
	return !r || !i || !r.type.compatibleContent(i.type) ? !1 : !r.content.size && t.parent.canReplace(a - 1, a) ? (n && n(e.tr.delete(t.pos - r.nodeSize, t.pos).scrollIntoView()), !0) : !t.parent.canReplace(a, a + 1) || !(i.isTextblock || Cl(e.doc, t.pos)) ? !1 : (n && n(e.tr.join(t.pos).scrollIntoView()), !0);
}
function Wu(e, t, n, r) {
	let i = t.nodeBefore, a = t.nodeAfter, o, s, c = i.type.spec.isolating || a.type.spec.isolating;
	if (!c && Uu(e, t, n)) return !0;
	let l = !c && t.parent.canReplace(t.index(), t.index() + 1);
	if (l && (o = (s = i.contentMatchAt(i.childCount)).findWrapping(a.type)) && s.matchType(o[0] || a.type).validEnd) {
		if (n) {
			let r = t.pos + a.nodeSize, s = M.empty;
			for (let e = o.length - 1; e >= 0; e--) s = M.from(o[e].create(null, s));
			s = M.from(i.copy(s));
			let c = e.tr.step(new rl(t.pos - 1, r, t.pos, r, new P(s, 1, 0), o.length, !0)), l = c.doc.resolve(r + 2 * o.length);
			l.nodeAfter && l.nodeAfter.type == i.type && Cl(c.doc, l.pos) && c.join(l.pos), n(c.scrollIntoView());
		}
		return !0;
	}
	let u = a.type.spec.isolating || r > 0 && c ? null : I.findFrom(t, 1), d = u && u.$from.blockRange(u.$to), f = d && ll(d);
	if (f != null && f >= t.depth) return n && n(e.tr.lift(d, f).scrollIntoView()), !0;
	if (l && wu(a, "start", !0) && wu(i, "end")) {
		let r = i, o = [];
		for (; o.push(r), !r.isTextblock;) r = r.lastChild;
		let s = a, c = 1;
		for (; !s.isTextblock; s = s.firstChild) c++;
		if (r.canReplace(r.childCount, r.childCount, s.content)) {
			if (n) {
				let r = M.empty;
				for (let e = o.length - 1; e >= 0; e--) r = M.from(o[e].copy(r));
				n(e.tr.step(new rl(t.pos - o.length, t.pos + a.nodeSize, t.pos + c, t.pos + a.nodeSize - c, new P(r, o.length, 0), 0, !0)).scrollIntoView());
			}
			return !0;
		}
	}
	return !1;
}
function Gu(e) {
	return function(t, n) {
		let r = t.selection, i = e < 0 ? r.$from : r.$to, a = i.depth;
		for (; i.node(a).isInline;) {
			if (!a) return !1;
			a--;
		}
		return i.node(a).isTextblock ? (n && n(t.tr.setSelection(L.create(t.doc, e < 0 ? i.start(a) : i.end(a)))), !0) : !1;
	};
}
var Ku = Gu(-1), qu = Gu(1);
function Ju(e, t = null) {
	return function(n, r) {
		let { $from: i, $to: a } = n.selection, o = i.blockRange(a), s = o && dl(o, e, t);
		return s ? (r && r(n.tr.wrap(o, s).scrollIntoView()), !0) : !1;
	};
}
function Yu(e, t = null) {
	return function(n, r) {
		let i = !1;
		for (let r = 0; r < n.selection.ranges.length && !i; r++) {
			let { $from: { pos: a }, $to: { pos: o } } = n.selection.ranges[r];
			n.doc.nodesBetween(a, o, (r, a) => {
				if (i) return !1;
				if (r.isTextblock && !r.hasMarkup(e, t)) {
					if (r.type == e) i = !0;
					else {
						let t = n.doc.resolve(a), r = t.index();
						i = t.parent.canReplaceWith(r, r + 1, e);
					}
				}
			});
		}
		if (!i) return !1;
		if (r) {
			let i = n.tr;
			for (let r = 0; r < n.selection.ranges.length; r++) {
				let { $from: { pos: a }, $to: { pos: o } } = n.selection.ranges[r];
				i.setBlockType(a, o, e, t);
			}
			r(i.scrollIntoView());
		}
		return !0;
	};
}
function Xu(...e) {
	return function(t, n, r) {
		for (let i = 0; i < e.length; i++) if (e[i](t, n, r)) return !0;
		return !1;
	};
}
var Zu = Xu(vu, bu, Tu), Qu = Xu(vu, Ou, ku), $u = {
	Enter: Xu(Pu, Lu, Ru, Bu),
	"Mod-Enter": Iu,
	Backspace: Zu,
	"Mod-Backspace": Zu,
	"Shift-Backspace": Zu,
	Delete: Qu,
	"Mod-Delete": Qu,
	"Mod-a": Hu
}, ed = {
	"Ctrl-h": $u.Backspace,
	"Alt-Backspace": $u["Mod-Backspace"],
	"Ctrl-d": $u.Delete,
	"Ctrl-Alt-Backspace": $u["Mod-Delete"],
	"Alt-Delete": $u["Mod-Delete"],
	"Alt-d": $u["Mod-Delete"],
	"Ctrl-a": Ku,
	"Ctrl-e": qu
};
for (let e in $u) ed[e] = $u[e];
typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform && os.platform();
// node_modules/prosemirror-schema-list/dist/index.js
function td(e, t = null) {
	return function(n, r) {
		let { $from: i, $to: a } = n.selection, o = i.blockRange(a);
		if (!o) return !1;
		let s = r ? n.tr : null;
		return nd(s, o, e, t) ? (r && r(s.scrollIntoView()), !0) : !1;
	};
}
function nd(e, t, n, r = null) {
	let i = !1, a = t, o = t.$from.doc;
	if (t.depth >= 2 && t.$from.node(t.depth - 1).type.compatibleContent(n) && t.startIndex == 0) {
		if (t.$from.index(t.depth - 1) == 0) return !1;
		let e = o.resolve(t.start - 2);
		a = new Is(e, e, t.depth), t.endIndex < t.parent.childCount && (t = new Is(t.$from, o.resolve(t.$to.end(t.depth)), t.depth)), i = !0;
	}
	let s = dl(a, n, r, t);
	return s ? (e && rd(e, t, s, i, n), !0) : !1;
}
function rd(e, t, n, r, i) {
	let a = M.empty;
	for (let e = n.length - 1; e >= 0; e--) a = M.from(n[e].type.create(n[e].attrs, a));
	e.step(new rl(t.start - (r ? 2 : 0), t.end, t.start, t.end, new P(a, 0, 0), n.length, !0));
	let o = 0;
	for (let e = 0; e < n.length; e++) n[e].type == i && (o = e + 1);
	let s = n.length - o, c = t.start + n.length - (r ? 2 : 0), l = t.parent;
	for (let n = t.startIndex, r = t.endIndex, i = !0; n < r; n++, i = !1) !i && s && xl(e.doc, c, s) && (e.split(c, s), c += 2 * s), c += l.child(n).nodeSize;
	return e;
}
function id(e, t) {
	return e instanceof oc ? t == e : e.indexOf(t) > -1;
}
function ad(e) {
	return function(t, n) {
		let { $from: r, $to: i } = t.selection, a = r.blockRange(i, (t) => t.childCount > 0 && id(e, t.firstChild.type));
		return a ? n ? id(e, r.node(a.depth - 1).type) ? od(t, n, a) : sd(t, n, a) : !0 : !1;
	};
}
function od(e, t, n) {
	let r = e.tr, i = n.end, a = n.$to.end(n.depth), o = n.parent.child(n.endIndex - 1).type;
	i < a && (r.step(new rl(i - 1, a, i, a, new P(M.from(o.create(null, n.parent.copy())), 1, 0), 1, !0)), n = new Is(r.doc.resolve(n.$from.pos), r.doc.resolve(a), n.depth));
	let s = ll(n);
	if (s == null) return !1;
	r.lift(n, s);
	let c = r.doc.resolve(r.mapping.map(i, -1) - 1);
	return Cl(r.doc, c.pos) && c.nodeBefore.type == c.nodeAfter.type && r.join(c.pos), t(r.scrollIntoView()), !0;
}
function sd(e, t, n) {
	let r = e.tr, i = n.parent;
	for (let e = n.end, t = n.endIndex - 1, a = n.startIndex; t > a; t--) e -= i.child(t).nodeSize, r.delete(e - 1, e + 1);
	let a = r.doc.resolve(n.start), o = a.nodeAfter;
	if (r.mapping.map(n.end) != n.start + a.nodeAfter.nodeSize) return !1;
	let s = n.startIndex == 0, c = n.endIndex == i.childCount, l = a.node(-1), u = a.index(-1);
	if (!l.canReplace(u + +!s, u + 1, o.content.append(c ? M.empty : M.from(i)))) return !1;
	let d = a.pos, f = d + o.nodeSize;
	return r.step(new rl(d - +!!s, f + +!!c, d + 1, f - 1, new P((s ? M.empty : M.from(i.copy(M.empty))).append(c ? M.empty : M.from(i.copy(M.empty))), +!s, +!c), +!s)), t(r.scrollIntoView()), !0;
}
function cd(e) {
	return function(t, n) {
		let { $from: r, $to: i } = t.selection, a = r.blockRange(i, (t) => t.childCount > 0 && id(e, t.firstChild.type));
		if (!a) return !1;
		let o = a.startIndex;
		if (o == 0) return !1;
		let s = a.parent, c = s.child(o - 1);
		if (!id(e, c.type)) return !1;
		if (n) {
			let e = c.lastChild && c.lastChild.type == s.type, r = M.from(e ? c.lastChild.lastChild.type.create() : null), i = new P(M.from(c.type.create(null, M.from(s.type.create(null, r)))), e ? 3 : 1, 0), o = a.start, l = a.end;
			n(t.tr.step(new rl(o - (e ? 3 : 1), l, o, l, i, 1, !0)).scrollIntoView());
		}
		return !0;
	};
}
// node_modules/prosemirror-view/dist/index.js
var ld = function(e) {
	for (var t = 0;; t++) if (e = e.previousSibling, !e) return t;
};
function ud(e) {
	let t = e.assignedSlot || e.parentNode;
	return t && t.nodeType == 11 ? t.host : t;
}
var dd = null;
function fd(e, t, n) {
	let r = dd ||= document.createRange();
	return r.setEnd(e, n ?? e.nodeValue.length), r.setStart(e, t || 0), r;
}
function pd() {
	dd = null;
}
function md(e, t, n, r) {
	return n && (gd(e, t, n, r, -1) || gd(e, t, n, r, 1));
}
var hd = /^(img|br|input|textarea|hr)$/i;
function gd(e, t, n, r, i) {
	for (;;) {
		if (e == n && t == r) return !0;
		if (t == (i < 0 ? 0 : _d(e))) {
			let n = e.parentNode;
			if (!n || !V(n) || Sd(e) || hd.test(e.nodeName) || e.contentEditable == "false") return !1;
			t = ld(e) + (i < 0 ? 0 : 1), e = n;
		} else if (V(e)) {
			let n = e.childNodes[t + (i < 0 ? -1 : 0)];
			if (V(n) && n.contentEditable == "false") {
				if (n.pmViewDesc?.ignoreForSelection) t += i;
				else return !1;
			} else e = n, t = i < 0 ? _d(e) : 0;
		} else return !1;
	}
}
function _d(e) {
	return e.nodeType == 3 ? e.nodeValue.length : e.childNodes.length;
}
function V(e) {
	return e.nodeType == 1;
}
function H(e) {
	return e.nodeType == 3;
}
function vd(e, t) {
	return t ? e.contains(V(t) ? t : t.parentNode) : !1;
}
function yd(e, t) {
	for (;;) {
		if (H(e) && t) return e;
		if (V(e) && t > 0) {
			if (e.contentEditable == "false") return null;
			e = e.childNodes[t - 1], t = _d(e);
		} else if (e.parentNode && !Sd(e)) t = ld(e), e = e.parentNode;
		else return null;
	}
}
function bd(e, t) {
	for (;;) {
		if (H(e) && t < e.nodeValue.length) return e;
		if (V(e) && t < e.childNodes.length) {
			if (e.contentEditable == "false") return null;
			e = e.childNodes[t], t = 0;
		} else if (e.parentNode && !Sd(e)) t = ld(e) + 1, e = e.parentNode;
		else return null;
	}
}
function xd(e, t, n) {
	for (let r = t == 0, i = t == _d(e); r || i;) {
		if (e == n) return !0;
		let t = ld(e);
		if (e = e.parentNode, !e) return !1;
		r &&= t == 0, i &&= t == _d(e);
	}
}
function Sd(e) {
	let t;
	for (let n = e; n && !(t = n.pmViewDesc); n = n.parentNode);
	return t && t.node && t.node.isBlock && (t.dom == e || t.contentDOM == e);
}
function Cd(e) {
	return e.focusNode && md(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset);
}
function wd(e, t) {
	e.collapse(t.anchorNode, t.anchorOffset), (t.focusNode != t.anchorNode || t.focusOffset != t.anchorOffset) && e.extend(t.focusNode, t.focusOffset);
}
function Td(e, t) {
	let n = document.createEvent("Event");
	return n.initEvent("keydown", !0, !0), n.keyCode = e, n.key = n.code = t, n;
}
function Ed(e) {
	let t = e.activeElement;
	for (; t && t.shadowRoot;) t = t.shadowRoot.activeElement;
	return t;
}
function Dd(e, t, n) {
	if (e.caretPositionFromPoint) try {
		let r = e.caretPositionFromPoint(t, n);
		if (r) return {
			node: r.offsetNode,
			offset: Math.min(_d(r.offsetNode), r.offset)
		};
	} catch {}
	if (e.caretRangeFromPoint) {
		let r = e.caretRangeFromPoint(t, n);
		if (r) return {
			node: r.startContainer,
			offset: Math.min(_d(r.startContainer), r.startOffset)
		};
	}
}
var Od = typeof navigator < "u" ? navigator : null, kd = typeof document < "u" ? document : null, Ad = Od && Od.userAgent || "", jd = /gecko\/(\d+)/i.test(Ad) && !/edge?\//i.test(Ad);
jd && +(/Firefox\/(\d+)/.exec(Ad) || [0, 0])[1];
var Md = /Chrome\/(\d+)/.exec(Ad), Nd = !!Md, Pd = Md ? +Md[1] : 0, Fd = !!Od && /Apple Computer/.test(Od.vendor), Id = Fd && (/Mobile\/\w+/.test(Ad) || !!Od && Od.maxTouchPoints > 2), Ld = Id || (Od ? /Mac/.test(Od.platform) : !1), Rd = Od ? /Win/.test(Od.platform) : !1, zd = /Android \d/.test(Ad), Bd = !!kd && "webkitFontSmoothing" in kd.documentElement.style, Vd = Bd ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0;
function Hd(e) {
	let t = e.defaultView && e.defaultView.visualViewport;
	return t ? {
		left: 0,
		right: t.width,
		top: 0,
		bottom: t.height
	} : {
		left: 0,
		right: e.documentElement.clientWidth,
		top: 0,
		bottom: e.documentElement.clientHeight
	};
}
function Ud(e, t) {
	return typeof e == "number" ? e : e[t];
}
function Wd(e) {
	let t = e.getBoundingClientRect(), n = t.width / e.offsetWidth || 1, r = t.height / e.offsetHeight || 1;
	return {
		left: t.left,
		right: t.left + e.clientWidth * n,
		top: t.top,
		bottom: t.top + e.clientHeight * r
	};
}
function Gd(e, t, n) {
	if (!sf(t) && t.left == 0) return;
	let r = e.someProp("scrollThreshold") || 0, i = e.someProp("scrollMargin") || 5, a = e.dom.ownerDocument;
	for (let o = n || e.dom; o;) {
		if (!V(o)) {
			o = ud(o);
			continue;
		}
		let e = o == a.body, n = e ? Hd(a) : Wd(o), s = 0, c = 0;
		if (t.top < n.top + Ud(r, "top") ? c = -(n.top - t.top + Ud(i, "top")) : t.bottom > n.bottom - Ud(r, "bottom") && (c = t.bottom - t.top > n.bottom - n.top ? t.top + Ud(i, "top") - n.top : t.bottom - n.bottom + Ud(i, "bottom")), t.left < n.left + Ud(r, "left") ? s = -(n.left - t.left + Ud(i, "left")) : t.right > n.right - Ud(r, "right") && (s = t.right - n.right + Ud(i, "right")), s || c) {
			if (e) a.defaultView.scrollBy(s, c);
			else {
				let e = o.scrollLeft, n = o.scrollTop;
				c && (o.scrollTop += c), s && (o.scrollLeft += s);
				let r = o.scrollLeft - e, i = o.scrollTop - n;
				t = {
					left: t.left - r,
					top: t.top - i,
					right: t.right - r,
					bottom: t.bottom - i
				};
			}
		}
		let l = e ? "fixed" : getComputedStyle(o).position;
		if (/^(fixed|sticky)$/.test(l)) break;
		o = l == "absolute" ? o.offsetParent : ud(o);
	}
}
function Kd(e) {
	let t = e.dom.getBoundingClientRect(), n = Math.max(0, t.top), r, i;
	for (let a = (t.left + t.right) / 2, o = n + 1; o < Math.min(innerHeight, t.bottom); o += 5) {
		let t = e.root.elementFromPoint(a, o);
		if (!t || t == e.dom || !e.dom.contains(t)) continue;
		let s = t.getBoundingClientRect();
		if (s.top >= n - 20) {
			r = t, i = s.top;
			break;
		}
	}
	return {
		refDOM: r,
		refTop: i,
		stack: qd(e.dom)
	};
}
function qd(e) {
	let t = [], n = e.ownerDocument;
	for (let r = e; r && (t.push({
		dom: r,
		top: r.scrollTop,
		left: r.scrollLeft
	}), e != n); r = ud(r));
	return t;
}
function Jd({ refDOM: e, refTop: t, stack: n }) {
	let r = e ? e.getBoundingClientRect().top : 0;
	Yd(n, r == 0 ? 0 : r - t);
}
function Yd(e, t) {
	for (let n = 0; n < e.length; n++) {
		let { dom: r, top: i, left: a } = e[n];
		r.scrollTop != i + t && (r.scrollTop = i + t), r.scrollLeft != a && (r.scrollLeft = a);
	}
}
var Xd = null;
function Zd(e) {
	if (e.setActive) return e.setActive();
	if (Xd) return e.focus(Xd);
	let t = qd(e);
	e.focus(Xd == null ? { get preventScroll() {
		return Xd = { preventScroll: !0 }, !0;
	} } : void 0), Xd || (Xd = !1, Yd(t, 0));
}
function Qd(e, t) {
	let n, r = 2e8, i, a = 0, o = t.top, s = t.top, c, l;
	for (let u = e.firstChild, d = 0; u; u = u.nextSibling, d++) {
		let e;
		if (V(u)) e = u.getClientRects();
		else if (H(u)) e = fd(u).getClientRects();
		else continue;
		for (let f = 0; f < e.length; f++) {
			let p = e[f];
			if (p.top <= o && p.bottom >= s) {
				o = Math.max(p.bottom, o), s = Math.min(p.top, s);
				let e = p.left > t.left ? p.left - t.left : p.right < t.left ? t.left - p.right : 0;
				if (e < r) {
					n = u, r = e, i = e && H(n) ? {
						left: p.right < t.left ? p.right : p.left,
						top: t.top
					} : t, V(u) && e && (a = d + +(t.left >= (p.left + p.right) / 2));
					continue;
				}
			} else p.top > t.top && !c && p.left <= t.left && p.right >= t.left && (c = u, l = {
				left: Math.max(p.left, Math.min(p.right, t.left)),
				top: p.top
			});
			!n && (t.left >= p.right && t.top >= p.top || t.left >= p.left && t.top >= p.bottom) && (a = d + 1);
		}
	}
	return !n && c && (n = c, i = l, r = 0), n && H(n) ? $d(n, i) : !n || r ? {
		node: e,
		offset: a
	} : Qd(n, i);
}
function $d(e, t) {
	let n = e.nodeValue.length, r = document.createRange(), i;
	for (let a = 0; a < n; a++) {
		r.setEnd(e, a + 1), r.setStart(e, a);
		let n = cf(r, 1);
		if (n.top != n.bottom && ef(t, n)) {
			i = {
				node: e,
				offset: a + +(t.left >= (n.left + n.right) / 2)
			};
			break;
		}
	}
	return r.detach(), i || {
		node: e,
		offset: 0
	};
}
function ef(e, t) {
	return e.left >= t.left - 1 && e.left <= t.right + 1 && e.top >= t.top - 1 && e.top <= t.bottom + 1;
}
function tf(e, t) {
	let n = e.parentNode;
	return n && /^li$/i.test(n.nodeName) && t.left < e.getBoundingClientRect().left ? n : e;
}
function nf(e, t, n) {
	let { node: r, offset: i } = Qd(t, n), a = -1;
	if (V(r) && !r.firstChild) {
		let e = r.getBoundingClientRect();
		a = e.left != e.right && n.left > (e.left + e.right) / 2 ? 1 : -1;
	}
	return e.docView.posFromDOM(r, i, a);
}
function rf(e, t, n, r) {
	let i = -1;
	for (let n = t, a = !1; n != e.dom;) {
		let t = e.docView.nearestDesc(n, !0), o;
		if (!t) return null;
		if (V(t.dom) && (t.node.isBlock && t.parent || !t.contentDOM) && ((o = t.dom.getBoundingClientRect()).width || o.height) && (t.node.isBlock && t.parent && !/^T(R|BODY|HEAD|FOOT)$/.test(t.dom.nodeName) && (!a && o.left > r.left || o.top > r.top ? i = t.posBefore : (!a && o.right < r.left || o.bottom < r.top) && (i = t.posAfter), a = !0), !t.contentDOM && i < 0 && !t.node.isText)) return (t.node.isBlock ? r.top < (o.top + o.bottom) / 2 : r.left < (o.left + o.right) / 2) ? t.posBefore : t.posAfter;
		n = t.dom.parentNode;
	}
	return i > -1 ? i : e.docView.posFromDOM(t, n, -1);
}
function af(e, t, n) {
	let r = e.childNodes.length;
	if (r && n.top < n.bottom) for (let i = Math.max(0, Math.min(r - 1, Math.floor(r * (t.top - n.top) / (n.bottom - n.top)) - 2)), a = i;;) {
		let n = e.childNodes[a];
		if (V(n)) {
			let e = n.getClientRects();
			for (let r = 0; r < e.length; r++) {
				let i = e[r];
				if (ef(t, i)) return af(n, t, i);
			}
		}
		if ((a = (a + 1) % r) == i) break;
	}
	return e;
}
function of(e, t) {
	let n = e.dom.ownerDocument, r, i = 0, a = Dd(n, t.left, t.top);
	a && ({node: r, offset: i} = a);
	let o = (e.root.elementFromPoint ? e.root : n).elementFromPoint(t.left, t.top), s;
	if (!o || !e.dom.contains(o)) {
		let n = e.dom.getBoundingClientRect();
		if (!ef(t, n) || (o = af(e.dom, t, n), !o)) return null;
	}
	if (Fd) for (let e = o; r && e; e = ud(e)) e.draggable && (r = void 0);
	if (o = tf(o, t), r) {
		if (jd && V(r) && (i = Math.min(i, r.childNodes.length), i < r.childNodes.length)) {
			let e = r.childNodes[i], n;
			e.nodeName == "IMG" && (n = e.getBoundingClientRect()).right <= t.left && n.bottom > t.top && i++;
		}
		let n;
		Bd && i && V(r) && V(n = r.childNodes[i - 1]) && n.contentEditable == "false" && n.getBoundingClientRect().top >= t.top && i--, r == e.dom && i == r.childNodes.length - 1 && V(r.lastChild) && t.top > r.lastChild.getBoundingClientRect().bottom ? s = e.state.doc.content.size : i != 0 && V(r) && r.childNodes[i - 1].nodeName == "BR" || (s = rf(e, r, i, t));
	}
	s ??= nf(e, o, t);
	let c = e.docView.nearestDesc(o, !0);
	return {
		pos: s,
		inside: c ? c.posAtStart - c.border : -1
	};
}
function sf(e) {
	return e.top < e.bottom || e.left < e.right;
}
function cf(e, t) {
	let n = e.getClientRects();
	if (n.length) {
		let e = n[t < 0 ? 0 : n.length - 1];
		if (sf(e)) return e;
	}
	return Array.prototype.find.call(n, sf) || e.getBoundingClientRect();
}
var lf = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
function uf(e, t, n) {
	let { node: r, offset: i, atom: a } = e.docView.domFromPos(t, n < 0 ? -1 : 1), o = Bd || jd;
	if (H(r)) {
		if (o && (lf.test(r.nodeValue) || (n < 0 ? !i : i == r.nodeValue.length))) {
			let e = cf(fd(r, i, i), n);
			if (jd && i && /\s/.test(r.nodeValue[i - 1]) && i < r.nodeValue.length) {
				let t = cf(fd(r, i - 1, i - 1), -1);
				if (t.top == e.top) {
					let n = cf(fd(r, i, i + 1), -1);
					if (n.top != e.top) return df(n, n.left < t.left);
				}
			}
			return e;
		}
		{
			let e = i, t = i, a = n < 0 ? 1 : -1;
			return n < 0 && !i ? (t++, a = -1) : n >= 0 && i == r.nodeValue.length ? (e--, a = 1) : n < 0 ? e-- : t++, df(cf(fd(r, e, t), a), a < 0);
		}
	}
	if (!e.state.doc.resolve(t - (a || 0)).parent.inlineContent) {
		if (a == null && i && (n < 0 || i == _d(r))) {
			let e = r.childNodes[i - 1];
			if (V(e)) return ff(e.getBoundingClientRect(), !1);
		}
		if (a == null && i < _d(r)) {
			let e = r.childNodes[i];
			if (V(e)) return ff(e.getBoundingClientRect(), !0);
		}
		return ff(r.getBoundingClientRect(), n >= 0);
	}
	if (a == null && i && (n < 0 || i == _d(r))) {
		let e = r.childNodes[i - 1], t = H(e) ? fd(e, _d(e) - +!o) : V(e) && (e.nodeName != "BR" || !e.nextSibling) ? e : null;
		if (t) return df(cf(t, 1), !1);
	}
	if (a == null && i < _d(r)) {
		let e = r.childNodes[i];
		for (; e.pmViewDesc && e.pmViewDesc.ignoreForCoords;) e = e.nextSibling;
		let t = e ? H(e) ? fd(e, 0, +!o) : V(e) ? e : null : null;
		if (t) return df(cf(t, -1), !0);
	}
	return df(cf(H(r) ? fd(r) : r, -n), n >= 0);
}
function df(e, t) {
	if (e.width == 0) return e;
	let n = t ? e.left : e.right;
	return {
		top: e.top,
		bottom: e.bottom,
		left: n,
		right: n
	};
}
function ff(e, t) {
	if (e.height == 0) return e;
	let n = t ? e.top : e.bottom;
	return {
		top: n,
		bottom: n,
		left: e.left,
		right: e.right
	};
}
function pf(e, t, n) {
	let r = e.state, i = e.root.activeElement;
	r != t && e.updateState(t), i != e.dom && e.focus();
	try {
		return n();
	} finally {
		r != t && e.updateState(r), i != e.dom && i && i.focus();
	}
}
function mf(e, t, n) {
	let r = t.selection, i = n == "up" ? r.$from : r.$to;
	return pf(e, t, () => {
		let { node: t } = e.docView.domFromPos(i.pos, n == "up" ? -1 : 1);
		for (;;) {
			let n = e.docView.nearestDesc(t, !0);
			if (!n) break;
			if (n.node.isBlock) {
				t = n.contentDOM || n.dom;
				break;
			}
			t = n.dom.parentNode;
		}
		let r = uf(e, i.pos, 1);
		for (let e = t.firstChild; e; e = e.nextSibling) {
			let t;
			if (V(e)) t = e.getClientRects();
			else if (H(e)) t = fd(e, 0, e.nodeValue.length).getClientRects();
			else continue;
			for (let e = 0; e < t.length; e++) {
				let i = t[e];
				if (i.bottom > i.top + 1 && (n == "up" ? r.top - i.top > (i.bottom - r.top) * 2 : i.bottom - r.bottom > (r.bottom - i.top) * 2)) return !1;
			}
		}
		return !0;
	});
}
var hf = /[\u0590-\u08ac]/;
function gf(e, t, n) {
	let { $head: r } = t.selection;
	if (!r.parent.isTextblock) return !1;
	let i = r.parentOffset, a = !i, o = i == r.parent.content.size, s = e.domSelection();
	return s ? !hf.test(r.parent.textContent) || !s.modify ? n == "left" || n == "backward" ? a : o : pf(e, t, () => {
		let t = e.domSel.readRange(), i = s.caretBidiLevel;
		s.modify("move", n, "character");
		let a = r.depth ? e.docView.domAfterPos(r.before()) : e.dom, { focusNode: o, focusOffset: c } = e.domSel.readRange(), l = o && !vd(a, o) || t.focusNode == o && t.focusOffset == c;
		return wd(s, t), i != null && (s.caretBidiLevel = i), l;
	}) : r.pos == r.start() || r.pos == r.end();
}
var _f = null, vf = null, yf = !1;
function bf(e, t, n) {
	return _f == t && vf == n ? yf : (_f = t, vf = n, yf = n == "up" || n == "down" ? mf(e, t, n) : gf(e, t, n));
}
var xf = class {
	constructor(e, t, n, r) {
		this.parent = e, this.children = t, this.dom = n, this.contentDOM = r, this.damage = 0, n.pmViewDesc = this;
	}
	matchesWidget(e) {
		return !1;
	}
	matchesMark(e) {
		return !1;
	}
	matchesNode(e, t, n) {
		return !1;
	}
	matchesHack(e) {
		return !1;
	}
	parseRule(e) {
		return null;
	}
	stopEvent(e) {
		return !1;
	}
	get size() {
		let e = 0;
		for (let t = 0; t < this.children.length; t++) e += this.children[t].size;
		return e;
	}
	get border() {
		return 0;
	}
	destroy() {
		this.parent = void 0, this.dom.pmViewDesc == this && (this.dom.pmViewDesc = void 0);
		for (let e = 0; e < this.children.length; e++) this.children[e].destroy();
	}
	posBeforeChild(e) {
		for (let t = 0, n = this.posAtStart;; t++) {
			let r = this.children[t];
			if (r == e) return n;
			n += r.size;
		}
	}
	get posBefore() {
		return this.parent.posBeforeChild(this);
	}
	get posAtStart() {
		return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
	}
	get posAfter() {
		return this.posBefore + this.size;
	}
	get posAtEnd() {
		return this.posAtStart + this.size - 2 * this.border;
	}
	localPosFromDOM(e, t, n) {
		if (this.contentDOM && vd(this.contentDOM, e)) {
			if (n < 0) {
				let n, r;
				if (e == this.contentDOM) n = e.childNodes[t - 1];
				else {
					for (; e.parentNode != this.contentDOM;) e = e.parentNode;
					n = e.previousSibling;
				}
				for (; n && !((r = n.pmViewDesc) && r.parent == this);) n = n.previousSibling;
				return n ? this.posBeforeChild(r) + r.size : this.posAtStart;
			}
			{
				let n, r;
				if (e == this.contentDOM) n = e.childNodes[t];
				else {
					for (; e.parentNode != this.contentDOM;) e = e.parentNode;
					n = e.nextSibling;
				}
				for (; n && !((r = n.pmViewDesc) && r.parent == this);) n = n.nextSibling;
				return n ? this.posBeforeChild(r) : this.posAtEnd;
			}
		}
		let r;
		if (e == this.dom && this.contentDOM) r = t > ld(this.contentDOM);
		else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM)) {
			let n = e.compareDocumentPosition(this.contentDOM);
			r = n & 16 ? t > Array.from(e.childNodes).findIndex((e) => e.contains(this.contentDOM)) : !(n & 4);
		} else if (this.dom.firstChild) {
			if (t == 0) for (let t = e;; t = t.parentNode) {
				if (t == this.dom) {
					r = !1;
					break;
				}
				if (t.previousSibling) break;
			}
			if (r == null && t == e.childNodes.length) for (let t = e;; t = t.parentNode) {
				if (t == this.dom) {
					r = !0;
					break;
				}
				if (t.nextSibling) break;
			}
		}
		return r ?? n > 0 ? this.posAtEnd : this.posAtStart;
	}
	nearestDesc(e, t = !1) {
		for (let n = !0, r = e; r; r = r.parentNode) {
			let i = this.getDesc(r), a;
			if (i && (!t || i.node)) {
				if (n && (a = i.nodeDOM) && !(V(a) ? vd(a, e) : a == e)) n = !1;
				else return i;
			}
		}
	}
	getDesc(e) {
		let t = e.pmViewDesc;
		for (let e = t; e; e = e.parent) if (e == this) return t;
	}
	posFromDOM(e, t, n) {
		for (let r = e; r; r = r.parentNode) {
			let i = this.getDesc(r);
			if (i) return i.localPosFromDOM(e, t, n);
		}
		return -1;
	}
	descAt(e) {
		for (let t = 0, n = 0; t < this.children.length; t++) {
			let r = this.children[t], i = n + r.size;
			if (n == e && i != n) {
				for (; !r.border && r.children.length;) for (let e = 0; e < r.children.length; e++) {
					let t = r.children[e];
					if (t.size) {
						r = t;
						break;
					}
				}
				return r;
			}
			if (e < i) return r.descAt(e - n - r.border);
			n = i;
		}
	}
	domFromPos(e, t) {
		if (!this.contentDOM) return {
			node: this.dom,
			offset: 0,
			atom: e + 1
		};
		let n = 0, r = 0;
		for (let t = 0; n < this.children.length; n++) {
			let i = this.children[n], a = t + i.size;
			if (a > e) {
				r = e - t;
				break;
			}
			t = a;
		}
		if (r) return this.children[n].domFromPos(r - this.children[n].border, t);
		for (; n > 0; n--) {
			let e = this.children[n - 1];
			if (e.size || !(e instanceof Of || e instanceof Sf && e.side >= 0)) break;
		}
		if (t <= 0) {
			let e, r = !0;
			for (; e = n ? this.children[n - 1] : null, e && e.dom.parentNode != this.contentDOM; n--, r = !1);
			return e && t && r && !e.border && !e.domAtom ? e.domFromPos(e.size, t) : {
				node: this.contentDOM,
				offset: e ? ld(e.dom) + 1 : 0
			};
		}
		{
			let e, r = !0;
			for (; e = n < this.children.length ? this.children[n] : null, e && e.dom.parentNode != this.contentDOM; n++, r = !1);
			return e && r && !e.border && !e.domAtom ? e.domFromPos(0, t) : {
				node: this.contentDOM,
				offset: e ? ld(e.dom) : this.contentDOM.childNodes.length
			};
		}
	}
	parseRange(e, t, n = 0) {
		if (this.children.length == 0) return {
			node: this.contentDOM,
			from: e,
			to: t,
			fromOffset: 0,
			toOffset: this.contentDOM.childNodes.length
		};
		let r = -1, i = -1;
		for (let a = n, o = 0;; o++) {
			let n = this.children[o], s = a + n.size;
			if (r == -1 && e <= s) {
				let i = a + n.border;
				if (e >= i && t <= s - n.border && n.node && n.contentDOM && this.contentDOM.contains(n.contentDOM)) return n.parseRange(e, t, i);
				e = a;
				for (let t = o; t > 0; t--) {
					let n = this.children[t - 1];
					if (n.size && n.dom.parentNode == this.contentDOM && !n.emptyChildAt(1)) {
						r = ld(n.dom) + 1;
						break;
					}
					e -= n.size;
				}
				r == -1 && (r = 0);
			}
			if (r > -1 && (s > t || o == this.children.length - 1)) {
				t = s;
				for (let e = o + 1; e < this.children.length; e++) {
					let n = this.children[e];
					if (n.size && n.dom.parentNode == this.contentDOM && !n.emptyChildAt(-1)) {
						i = ld(n.dom);
						break;
					}
					t += n.size;
				}
				i == -1 && (i = this.contentDOM.childNodes.length);
				break;
			}
			a = s;
		}
		return {
			node: this.contentDOM,
			from: e,
			to: t,
			fromOffset: r,
			toOffset: i
		};
	}
	emptyChildAt(e) {
		if (this.border || !this.contentDOM || !this.children.length) return !1;
		let t = this.children[e < 0 ? 0 : this.children.length - 1];
		return t.size == 0 || t.emptyChildAt(e);
	}
	domAfterPos(e) {
		let { node: t, offset: n } = this.domFromPos(e, 0);
		if (!V(t) || n == t.childNodes.length) throw RangeError("No node after pos " + e);
		return t.childNodes[n];
	}
	ignoreMutation(e) {
		return !this.contentDOM && e.type != "selection";
	}
	get contentLost() {
		return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM);
	}
	markDamage(e) {
		e && (this.damage |= e, this.markParentDamage());
	}
	markParentDamage() {
		for (let e = this;;) {
			let { parent: t } = e;
			if (!t || t.damage & 1) break;
			t.damage |= 1, e = t;
		}
	}
	get domAtom() {
		return !1;
	}
	get ignoreForCoords() {
		return !1;
	}
	get ignoreForSelection() {
		return !1;
	}
	isText(e) {
		return !1;
	}
}, Sf = class extends xf {
	constructor(e, t, n, r) {
		let i, a = t.type.toDOM;
		if (typeof a == "function" && (a = a(n, () => {
			if (!i) return r;
			if (i.parent) return i.parent.posBeforeChild(i);
		})), !t.type.spec.raw) {
			let e = V(a) ? a : document.createElement("span");
			e != a && (e.appendChild(a), a = e), e.hasAttribute("contenteditable") || (e.contentEditable = "false"), e.classList.add("ProseMirror-widget");
		}
		super(e, [], a, null), this.widget = t, this.widget = t, i = this;
	}
	matchesWidget(e) {
		return !this.damage && e.type.eq(this.widget.type);
	}
	parseRule() {
		return { ignore: !0 };
	}
	stopEvent(e) {
		let t = this.widget.spec.stopEvent;
		return t ? t(e) : !1;
	}
	ignoreMutation(e) {
		return e.type != "selection" || this.widget.spec.ignoreSelection;
	}
	destroy() {
		this.widget.type.destroy(this.dom), super.destroy();
	}
	get domAtom() {
		return !0;
	}
	get ignoreForSelection() {
		return !!this.widget.type.spec.relaxedSide;
	}
	get side() {
		return this.widget.type.side;
	}
}, Cf = class extends xf {
	constructor(e, t, n, r) {
		super(e, [], t, null), this.textDOM = n, this.text = r;
	}
	get size() {
		return this.text.length;
	}
	localPosFromDOM(e, t) {
		return e == this.textDOM ? this.posAtStart + t : this.posAtStart + (t ? this.size : 0);
	}
	domFromPos(e) {
		return {
			node: this.textDOM,
			offset: e
		};
	}
	ignoreMutation(e) {
		return e.type === "characterData" && e.target.nodeValue == e.oldValue;
	}
}, wf = class e extends xf {
	constructor(e, t, n, r, i) {
		super(e, [], n, r), this.mark = t, this.spec = i;
	}
	static create(t, n, r, i) {
		let a = i.nodeViews[n.type.name], o = a && a(n, i, r);
		return o && o.dom || (o = Oc.renderSpec(document, n.type.spec.toDOM(n, r), null, n.attrs)), new e(t, n, o.dom, o.contentDOM || o.dom, o);
	}
	parseRule() {
		return this.damage & 4 || this.mark.type.spec.reparseInView ? null : {
			mark: this.mark.type.name,
			attrs: this.mark.attrs,
			contentElement: this.contentDOM
		};
	}
	matchesMark(e) {
		return !(this.damage & 4) && this.mark.eq(e);
	}
	markDamage(e) {
		var t;
		this.damage |= e, (t = this.parent) == null || t.markDamage(2);
	}
	slice(t, n, r) {
		let i = e.create(this.parent, this.mark, !0, r), a = this.children, o = this.size;
		n < o && (a = Gf(a, n, o, r)), t > 0 && (a = Gf(a, 0, t, r));
		for (let e = 0; e < a.length; e++) a[e].parent = i;
		return i.children = a, i;
	}
	ignoreMutation(e) {
		return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
	}
	destroy() {
		this.spec.destroy && this.spec.destroy(), super.destroy();
	}
}, Tf = class e extends xf {
	constructor(e, t, n, r, i, a, o) {
		super(e, [], i, a), this.node = t, this.outerDeco = n, this.innerDeco = r, this.nodeDOM = o;
	}
	static create(t, n, r, i, a, o) {
		let s = a.nodeViews[n.type.name], c, l = s && s(n, a, () => {
			if (!c) return o;
			if (c.parent) return c.parent.posBeforeChild(c);
		}, r, i), u = l && l.dom, d = l && l.contentDOM;
		if (n.isText) {
			if (!u) u = document.createTextNode(n.text);
			else if (!H(u)) throw RangeError("Text must be rendered as a DOM text node");
		} else if (!u) {
			let e = Oc.renderSpec(document, n.type.spec.toDOM(n), null, n.attrs);
			({dom: u, contentDOM: d} = e);
		}
		!d && !n.isText && u.nodeName != "BR" && (u.hasAttribute("contenteditable") || (u.contentEditable = "false"), n.type.spec.draggable && (u.draggable = !0));
		let f = u;
		return u = If(u, r, n), l ? c = new kf(t, n, r, i, u, d || null, f, l) : n.isText ? new Df(t, n, r, i, u, f) : new e(t, n, r, i, u, d || null, f);
	}
	parseRule(e) {
		if (this.node.type.spec.reparseInView) return null;
		let t = {
			node: this.node.type.name,
			attrs: this.node.attrs
		};
		if (this.node.type.whitespace == "pre" && (t.preserveWhitespace = "full"), !this.contentDOM) t.getContent = () => this.node.content;
		else if (!this.contentLost) t.contentElement = this.contentDOM;
		else {
			for (let e = this.children.length - 1; e >= 0; e--) {
				let n = this.children[e];
				if (this.dom.contains(n.dom.parentNode)) {
					t.contentElement = n.dom.parentNode;
					break;
				}
			}
			if (!t.contentElement) {
				let n = e && e.find((t) => V(t) && e.indexOf(t.parentNode) < 0 && this.dom.contains(t));
				n ? t.contentElement = n : t.getContent = () => M.empty;
			}
		}
		return t;
	}
	matchesNode(e, t, n) {
		return !this.damage && e.eq(this.node) && Lf(t, this.outerDeco) && n.eq(this.innerDeco);
	}
	get size() {
		return this.node.nodeSize;
	}
	get border() {
		return +!this.node.isLeaf;
	}
	updateChildren(e, t) {
		let n = this.node.inlineContent, r = t, i = e.composing ? this.localCompositionInfo(e, t) : null, a = i && i.pos > -1 ? i : null, o = i && i.pos < 0, s = new zf(this, a && a.node, e), c = this.node.inlineContent, l = c && this.node.isBlock;
		Hf(this.node, this.innerDeco, (t, i, a) => {
			t.spec.marks ? s.syncToMarks(t.spec.marks, n, e, i) : t.type.side >= 0 && !a && s.syncToMarks(i == this.node.childCount ? N.none : this.node.child(i).marks, n, e, i), s.placeWidget(t, e, r);
		}, (t, a, u, d) => {
			s.syncToMarks(t.marks, n, e, d), l && t.isAtom && !t.isText && s.addHackNode("IMG", s.top);
			let f;
			s.findNodeMatch(t, a, u, d) || o && e.state.selection.from > r && e.state.selection.to < r + t.nodeSize && (f = s.findIndexWithChild(i.node)) > -1 && s.updateNodeAt(t, a, u, f, e, r) || s.updateNextNode(t, a, u, e, d, r) || s.addNode(t, a, u, e, r), r += t.nodeSize, c && (l = t.isAtom && !t.isText);
		}), s.syncToMarks([], n, e, 0), this.node.isTextblock && s.addTextblockHacks(), s.destroyRest(), (s.changed || this.damage & 2) && (a && this.protectLocalComposition(e, a), Af(this.contentDOM, this.children, e), Id && Uf(this.dom));
	}
	localCompositionInfo(e, t) {
		let { from: n, to: r } = e.state.selection;
		if (!(e.state.selection instanceof L) || n < t || r > t + this.node.content.size) return null;
		let i = e.input.compositionNode;
		if (!i || !this.dom.contains(i.parentNode)) return null;
		if (this.node.inlineContent) {
			let e = i.nodeValue, a = Wf(this.node.content, e, n - t, r - t);
			return a < 0 ? null : {
				node: i,
				pos: a,
				text: e
			};
		}
		return {
			node: i,
			pos: -1,
			text: ""
		};
	}
	protectLocalComposition(e, { node: t, pos: n, text: r }) {
		if (this.getDesc(t)) return;
		let i = t;
		for (; i.parentNode != this.contentDOM; i = i.parentNode) {
			for (; i.previousSibling;) i.parentNode.removeChild(i.previousSibling);
			for (; i.nextSibling;) i.parentNode.removeChild(i.nextSibling);
			i.pmViewDesc && (i.pmViewDesc = void 0);
		}
		let a = new Cf(this, i, t, r);
		e.input.compositionNodes.push(a), this.children = Gf(this.children, n, n + r.length, e, a);
	}
	update(e, t, n, r, i) {
		return this.damage & 4 || !e.sameMarkup(this.node) ? !1 : (this.updateInner(e, t, n, r, i), !0);
	}
	updateInner(e, t, n, r, i) {
		this.updateOuterDeco(t), this.node = e, this.innerDeco = n, this.contentDOM && this.updateChildren(r, i + 1), this.damage = 0;
	}
	updateOuterDeco(e) {
		if (Lf(e, this.outerDeco)) return;
		let t = !V(this.nodeDOM), n = this.dom;
		this.dom = Pf(this.dom, this.nodeDOM, Nf(this.outerDeco, this.node, t), Nf(e, this.node, t)), this.dom != n && (n.pmViewDesc = void 0, this.dom.pmViewDesc = this), this.outerDeco = e;
	}
	selectNode() {
		V(this.nodeDOM) && (this.nodeDOM.classList.add("ProseMirror-selectednode"), (this.contentDOM || !this.node.type.spec.draggable) && (this.nodeDOM.draggable = !0));
	}
	deselectNode() {
		V(this.nodeDOM) && (this.nodeDOM.classList.remove("ProseMirror-selectednode"), (this.contentDOM || !this.node.type.spec.draggable) && this.nodeDOM.removeAttribute("draggable"));
	}
	get domAtom() {
		return this.node.isAtom;
	}
};
function Ef(e, t, n, r, i, a) {
	a ? Pf(r, r, Nf(a, e, !1), Nf(t, e, !1)) : If(r, t, e);
	let o = new Tf(void 0, e, t, n, r, r, r);
	return o.contentDOM && o.updateChildren(i, 0), o;
}
var Df = class e extends Tf {
	constructor(e, t, n, r, i, a) {
		super(e, t, n, r, i, null, a);
	}
	parseRule() {
		let e = this.nodeDOM.parentNode;
		for (; e && e != this.dom && !e.pmIsDeco;) e = e.parentNode;
		return { skip: e || !0 };
	}
	update(e, t, n, r) {
		return this.damage & 4 || this.damage && !this.inParent() || !e.sameMarkup(this.node) ? !1 : (this.updateOuterDeco(t), (this.damage & 8 || e.text != this.node.text) && e.text != this.nodeDOM.nodeValue && (this.nodeDOM.nodeValue = e.text, r.trackWrites == this.nodeDOM && (r.trackWrites = null)), this.node = e, this.damage = 0, !0);
	}
	inParent() {
		let e = this.parent.contentDOM;
		for (let t = this.nodeDOM; t; t = t.parentNode) if (t == e) return !0;
		return !1;
	}
	domFromPos(e) {
		return {
			node: this.nodeDOM,
			offset: e
		};
	}
	localPosFromDOM(e, t, n) {
		return e == this.nodeDOM ? this.posAtStart + Math.min(t, this.node.text.length) : super.localPosFromDOM(e, t, n);
	}
	ignoreMutation(e) {
		return !1;
	}
	slice(t, n, r) {
		let i = this.node.cut(t, n), a = document.createTextNode(i.text);
		return new e(this.parent, i, this.outerDeco, this.innerDeco, a, a);
	}
	get domAtom() {
		return !1;
	}
	isText(e) {
		return this.node.text == e;
	}
}, Of = class extends xf {
	parseRule() {
		return { ignore: !0 };
	}
	matchesHack(e) {
		return !this.damage && this.dom.nodeName == e;
	}
	get domAtom() {
		return !0;
	}
	get ignoreForCoords() {
		return this.dom.nodeName == "IMG";
	}
}, kf = class extends Tf {
	constructor(e, t, n, r, i, a, o, s) {
		super(e, t, n, r, i, a, o), this.spec = s;
	}
	update(e, t, n, r, i) {
		if (this.damage & 4) return !1;
		if (this.spec.update && (this.node.type == e.type || this.spec.multiType)) {
			let a = this.spec.update(e, t, n);
			return a && this.updateInner(e, t, n, r, i), a;
		}
		return !this.contentDOM && !e.isLeaf ? !1 : super.update(e, t, n, r, i);
	}
	selectNode() {
		this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
	}
	deselectNode() {
		this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
	}
	destroy() {
		this.spec.destroy && this.spec.destroy(), super.destroy();
	}
	stopEvent(e) {
		return this.spec.stopEvent ? this.spec.stopEvent(e) : !1;
	}
	ignoreMutation(e) {
		return this.spec.ignoreMutation ? this.spec.ignoreMutation(e) : super.ignoreMutation(e);
	}
};
function Af(e, t, n) {
	let r = e.firstChild, i = !1;
	for (let a = 0; a < t.length; a++) {
		let o = t[a], s = o.dom;
		if (s.parentNode == e) {
			for (; s != r;) r = Rf(r), i = !0;
			r = r.nextSibling;
		} else i = !0, e.insertBefore(s, r);
		if (o instanceof wf) {
			let t = r ? r.previousSibling : e.lastChild;
			Af(o.contentDOM, o.children, n), r = t ? t.nextSibling : e.firstChild;
		}
	}
	for (; r;) r = Rf(r), i = !0;
	i && n.trackWrites == e && (n.trackWrites = null);
}
var jf = function(e) {
	e && (this.nodeName = e);
};
jf.prototype = Object.create(null);
var Mf = [new jf()];
function Nf(e, t, n) {
	if (e.length == 0) return Mf;
	let r = n ? Mf[0] : new jf(), i = [r];
	for (let a = 0; a < e.length; a++) {
		let o = e[a].type.attrs;
		if (o) {
			o.nodeName && i.push(r = new jf(o.nodeName));
			for (let e in o) {
				let a = o[e];
				a != null && (n && i.length == 1 && i.push(r = new jf(t.isInline ? "span" : "div")), e == "class" ? r.class = (r.class ? r.class + " " : "") + a : e == "style" ? r.style = (r.style ? r.style + ";" : "") + a : e != "nodeName" && (r[e] = a));
			}
		}
	}
	return i;
}
function Pf(e, t, n, r) {
	if (n == Mf && r == Mf) return t;
	let i = t;
	for (let t = 0; t < r.length; t++) {
		let a = r[t], o = n[t];
		if (t) {
			let t;
			o && o.nodeName == a.nodeName && i != e && (t = i.parentNode) && t.nodeName.toLowerCase() == a.nodeName || (t = document.createElement(a.nodeName), t.pmIsDeco = !0, t.appendChild(i), o = Mf[0]), i = t;
		}
		Ff(i, o || Mf[0], a);
	}
	return i;
}
function Ff(e, t, n) {
	for (let r in t) r != "class" && r != "style" && r != "nodeName" && !(r in n) && e.removeAttribute(r);
	for (let r in n) r != "class" && r != "style" && r != "nodeName" && n[r] != t[r] && e.setAttribute(r, n[r]);
	if (t.class != n.class) {
		let r = t.class ? t.class.split(" ").filter(Boolean) : [], i = n.class ? n.class.split(" ").filter(Boolean) : [];
		for (let t = 0; t < r.length; t++) i.indexOf(r[t]) == -1 && e.classList.remove(r[t]);
		for (let t = 0; t < i.length; t++) r.indexOf(i[t]) == -1 && e.classList.add(i[t]);
		e.classList.length == 0 && e.removeAttribute("class");
	}
	if (t.style != n.style) {
		if (t.style) {
			let n = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, r;
			for (; r = n.exec(t.style);) e.style.removeProperty(r[1]);
		}
		n.style && (e.style.cssText += n.style);
	}
}
function If(e, t, n) {
	return Pf(e, e, Mf, Nf(t, n, !V(e)));
}
function Lf(e, t) {
	if (e.length != t.length) return !1;
	for (let n = 0; n < e.length; n++) if (!e[n].type.eq(t[n].type)) return !1;
	return !0;
}
function Rf(e) {
	let t = e.nextSibling;
	return e.parentNode.removeChild(e), t;
}
var zf = class {
	constructor(e, t, n) {
		this.lock = t, this.view = n, this.index = 0, this.stack = [], this.changed = !1, this.top = e, this.preMatch = Bf(e.node.content, e);
	}
	destroyBetween(e, t) {
		if (e != t) {
			for (let n = e; n < t; n++) this.top.children[n].destroy();
			this.top.children.splice(e, t - e), this.changed = !0;
		}
	}
	destroyRest() {
		this.destroyBetween(this.index, this.top.children.length);
	}
	syncToMarks(e, t, n, r) {
		let i = 0, a = this.stack.length >> 1, o = Math.min(a, e.length);
		for (; i < o && (i == a - 1 ? this.top : this.stack[i + 1 << 1]).matchesMark(e[i]) && e[i].type.spec.spanning !== !1;) i++;
		for (; i < a;) this.destroyRest(), this.top.damage = 0, this.index = this.stack.pop(), this.top = this.stack.pop(), a--;
		for (; a < e.length;) {
			this.stack.push(this.top, this.index + 1);
			let i = -1, o = this.top.children.length;
			r < this.preMatch.index && (o = Math.min(this.index + 3, o));
			for (let t = this.index; t < o; t++) {
				let n = this.top.children[t];
				if (n.matchesMark(e[a]) && !this.isLocked(n.dom)) {
					i = t;
					break;
				}
			}
			if (i < 0 && this.index < this.top.children.length) {
				let t = this.top.children[this.index];
				t instanceof wf && !(t.damage & 4) && t.mark.type == e[a].type && t.spec.update && !this.isLocked(t.dom) && t.spec.update(e[a]) && (t.mark = e[a], i = this.index, this.changed = !0);
			}
			if (i > -1) i > this.index && (this.changed = !0, this.destroyBetween(this.index, i)), this.top = this.top.children[this.index];
			else {
				let r = wf.create(this.top, e[a], t, n);
				this.top.children.splice(this.index, 0, r), this.top = r, this.changed = !0;
			}
			this.index = 0, a++;
		}
	}
	findNodeMatch(e, t, n, r) {
		let i = -1, a;
		if (r >= this.preMatch.index && (a = this.preMatch.matches[r - this.preMatch.index]).parent == this.top && a.matchesNode(e, t, n)) i = this.top.children.indexOf(a, this.index);
		else for (let r = this.index, a = Math.min(this.top.children.length, r + 5); r < a; r++) {
			let a = this.top.children[r];
			if (a.matchesNode(e, t, n) && !this.preMatch.matched.has(a)) {
				i = r;
				break;
			}
		}
		return i < 0 ? !1 : (this.destroyBetween(this.index, i), this.index++, !0);
	}
	updateNodeAt(e, t, n, r, i, a) {
		let o = this.top.children[r];
		return o.damage & 4 && o.dom == o.contentDOM && (o.damage = 2), o.update(e, t, n, i, a) ? (this.destroyBetween(this.index, r), this.index++, !0) : !1;
	}
	findIndexWithChild(e) {
		for (;;) {
			let t = e.parentNode;
			if (!t) return -1;
			if (t == this.top.contentDOM) {
				let t = e.pmViewDesc;
				if (t) {
					for (let e = this.index; e < this.top.children.length; e++) if (this.top.children[e] == t) return e;
				}
				return -1;
			}
			e = t;
		}
	}
	updateNextNode(e, t, n, r, i, a) {
		for (let o = this.index; o < this.top.children.length; o++) {
			let s = this.top.children[o];
			if (s instanceof Tf) {
				let c = this.preMatch.matched.get(s);
				if (c != null && c != i) return !1;
				let l = s.dom, u, d = this.isLocked(l) && !(e.isText && s.node && s.node.isText && s.nodeDOM.nodeValue == e.text && !(s.damage & 4) && Lf(t, s.outerDeco));
				if (!d && s.update(e, t, n, r, a)) return this.destroyBetween(this.index, o), s.dom != l && (this.changed = !0), this.index++, !0;
				if (!d && (u = this.recreateWrapper(s, e, t, n, r, a))) return this.destroyBetween(this.index, o), this.top.children[this.index] = u, u.contentDOM && (u.damage |= 2, u.updateChildren(r, a + 1), u.damage = 0), this.changed = !0, this.index++, !0;
				break;
			}
		}
		return !1;
	}
	recreateWrapper(e, t, n, r, i, a) {
		if (e.damage & 3 || t.isAtom || !e.children.length || !e.node.content.eq(t.content) || !Lf(n, e.outerDeco) || !r.eq(e.innerDeco)) return null;
		let o = Tf.create(this.top, t, n, r, i, a);
		if (o.contentDOM) {
			o.children = e.children, e.children = [];
			for (let e of o.children) e.parent = o;
		}
		return e.destroy(), o;
	}
	addNode(e, t, n, r, i) {
		let a = Tf.create(this.top, e, t, n, r, i);
		a.contentDOM && a.updateChildren(r, i + 1), this.top.children.splice(this.index++, 0, a), this.changed = !0;
	}
	placeWidget(e, t, n) {
		let r = this.index < this.top.children.length ? this.top.children[this.index] : null;
		if (r && r.matchesWidget(e) && (e == r.widget || !r.widget.type.toDOM.parentNode)) this.index++;
		else {
			let r = new Sf(this.top, e, t, n);
			this.top.children.splice(this.index++, 0, r), this.changed = !0;
		}
	}
	addTextblockHacks() {
		let e = this.top.children[this.index - 1], t = this.top;
		for (; e instanceof wf;) t = e, e = t.children[t.children.length - 1];
		(!e || !(e instanceof Df) || /\n$/.test(e.node.text) || this.view.requiresGeckoHackNode && /\s$/.test(e.node.text)) && ((Fd || Nd) && e && e.dom.contentEditable == "false" && this.addHackNode("IMG", t), this.addHackNode("BR", this.top));
	}
	addHackNode(e, t) {
		if (t == this.top && this.index < t.children.length && t.children[this.index].matchesHack(e)) this.index++;
		else {
			let n = document.createElement(e);
			e == "IMG" && (n.className = "ProseMirror-separator", n.alt = ""), e == "BR" && (n.className = "ProseMirror-trailingBreak");
			let r = new Of(this.top, [], n, null);
			t == this.top ? t.children.splice(this.index++, 0, r) : t.children.push(r), this.changed = !0;
		}
	}
	isLocked(e) {
		return this.lock && (e == this.lock || V(e) && e.contains(this.lock.parentNode));
	}
};
function Bf(e, t) {
	let n = t, r = n.children.length, i = [], a = e.childCount, o = /* @__PURE__ */ new Map(), s = [];
	outer: for (; a > 0;) {
		let c;
		for (;;) if (r) {
			let e = n.children[r - 1];
			if (e instanceof wf) i.push(r - 1), n = e, r = e.children.length;
			else {
				c = e, r--;
				break;
			}
		} else if (n == t) break outer;
		else r = i.pop(), n = n.parent;
		let l = c.node;
		if (l) {
			if (l != e.child(a - 1)) break;
			--a, o.set(c, a), s.push(c);
		}
	}
	return {
		index: a,
		matched: o,
		matches: s.reverse()
	};
}
function Vf(e, t) {
	return e.type.side - t.type.side;
}
function Hf(e, t, n, r) {
	let i = t.locals(e), a = 0;
	if (i.length == 0) {
		for (let n = 0; n < e.childCount; n++) {
			let o = e.child(n);
			r(o, i, t.forChild(a, o), n), a += o.nodeSize;
		}
		return;
	}
	let o = 0, s = [], c = null;
	for (let l = 0;;) {
		let u, d;
		for (; o < i.length && i[o].to == a;) {
			let e = i[o++];
			e.widget && (u ? (d ||= [u]).push(e) : u = e);
		}
		if (u) {
			if (d) {
				d.sort(Vf);
				for (let e = 0; e < d.length; e++) n(d[e], l, !!c);
			} else n(u, l, !!c);
		}
		let f, p;
		if (c) p = -1, f = c, c = null;
		else if (l < e.childCount) p = l, f = e.child(l++);
		else break;
		for (let e = 0; e < s.length; e++) s[e].to <= a && s.splice(e--, 1);
		for (; o < i.length && i[o].from <= a && i[o].to > a;) s.push(i[o++]);
		let m = a + f.nodeSize;
		if (f.isText) {
			let e = m;
			o < i.length && i[o].from < e && (e = i[o].from);
			for (let t = 0; t < s.length; t++) s[t].to < e && (e = s[t].to);
			e < m && (c = f.cut(e - a), f = f.cut(0, e - a), m = e, p = -1);
		} else for (; o < i.length && i[o].to < m;) o++;
		let h = f.isInline && !f.isLeaf ? s.filter((e) => !e.inline) : s.slice();
		r(f, h, t.forChild(a, f), p), a = m;
	}
}
function Uf(e) {
	if (e.nodeName == "UL" || e.nodeName == "OL") {
		let t = e.style.cssText;
		e.style.cssText = t + "; list-style: square !important", window.getComputedStyle(e).listStyle, e.style.cssText = t;
	}
}
function Wf(e, t, n, r) {
	for (let i = 0, a = 0; i < e.childCount && a <= r;) {
		let o = e.child(i++), s = a;
		if (a += o.nodeSize, !o.isText) continue;
		let c = o.text;
		for (; i < e.childCount;) {
			let t = e.child(i++);
			if (a += t.nodeSize, !t.isText) break;
			c += t.text;
		}
		if (a >= n) {
			if (a >= r && c.slice(r - t.length - s, r - s) == t) return r - t.length;
			let e = s < r ? c.lastIndexOf(t, r - s - 1) : -1;
			if (e >= 0 && e + t.length + s >= n) return s + e;
			if (n == r && c.length >= r + t.length - s && c.slice(r - s, r - s + t.length) == t) return r;
		}
	}
	return -1;
}
function Gf(e, t, n, r, i) {
	let a = [];
	for (let o = 0, s = 0; o < e.length; o++) {
		let c = e[o], l = s, u = s += c.size;
		l >= n || u <= t ? a.push(c) : (l < t && a.push(c.slice(0, t - l, r)), i &&= (a.push(i), void 0), u > n && a.push(c.slice(n - l, c.size, r)));
	}
	return a;
}
function Kf(e, t) {
	let { $anchor: n, $head: r } = e.selection, i = t > 0 ? n.max(r) : n.min(r), a = i.parent.inlineContent ? i.depth ? e.doc.resolve(t > 0 ? i.after() : i.before()) : null : i;
	return a && I.findFrom(a, t);
}
function qf(e, t) {
	return e.dispatch(e.state.tr.setSelection(t).scrollIntoView()), !0;
}
function Jf(e, t, n) {
	let r = e.state.selection;
	if (r instanceof L) {
		if (n.indexOf("s") > -1) {
			let { $head: n } = r, i = n.textOffset ? null : t < 0 ? n.nodeBefore : n.nodeAfter;
			if (!i || i.isText || !i.isLeaf) return !1;
			let a = e.state.doc.resolve(n.pos + i.nodeSize * (t < 0 ? -1 : 1));
			return qf(e, new L(r.$anchor, a));
		}
		if (!r.empty) return !1;
		if (e.endOfTextblock(t > 0 ? "forward" : "backward")) {
			let n = Kf(e.state, t);
			return n && n instanceof R ? qf(e, n) : !1;
		}
		if (!Ld || n.indexOf("m") < 0) {
			let n = r.$head, i = n.textOffset ? null : t < 0 ? n.nodeBefore : n.nodeAfter, a;
			if (!i || i.isText) return !1;
			let o = t < 0 ? n.pos - i.nodeSize : n.pos;
			return i.isAtom || (a = e.docView.descAt(o)) && !a.contentDOM ? R.isSelectable(i) ? qf(e, new R(t < 0 ? e.state.doc.resolve(n.pos - i.nodeSize) : n)) : qf(e, new L(e.state.doc.resolve(t < 0 ? o : o + i.nodeSize))) : !1;
		}
	} else if (r instanceof R && r.node.isInline) return qf(e, new L(t > 0 ? r.$to : r.$from));
	else {
		let n = Kf(e.state, t);
		return n ? qf(e, n) : !1;
	}
}
function Yf(e, t) {
	let n = e.pmViewDesc;
	return n ? n.size == 0 && (t < 0 || e.nextSibling || e.nodeName != "BR") : V(e) && e.contentEditable == "false";
}
function Xf(e, t) {
	return t < 0 ? Zf(e) : Qf(e);
}
function Zf(e) {
	let t = e.domSel.readRange(), n = t.focusNode, r = t.focusOffset;
	if (!n) return;
	let i, a, o = !1;
	for (jd && V(n) && r < _d(n) && Yf(n.childNodes[r], -1) && (o = !0);;) if (r > 0) {
		if (!V(n)) break;
		let e = n.childNodes[r - 1];
		if (Yf(e, -1)) i = n, a = --r;
		else if (H(e)) n = e, r = n.nodeValue.length;
		else break;
	} else if ($f(n)) break;
	else {
		let t = n.previousSibling;
		for (; t && Yf(t, -1);) i = n.parentNode, a = ld(t), t = t.previousSibling;
		if (t) n = t, r = _d(n);
		else {
			if (n = n.parentNode, n == e.dom) break;
			r = 0;
		}
	}
	o ? np(e, n, r) : i && np(e, i, a);
}
function Qf(e) {
	let t = e.domSel.readRange(), n = t.focusNode, r = t.focusOffset;
	if (!n) return;
	let i = _d(n), a, o;
	for (;;) if (r < i) {
		if (!V(n)) break;
		let e = n.childNodes[r];
		if (Yf(e, 1)) a = n, o = ++r;
		else break;
	} else if ($f(n)) break;
	else {
		let t = n.nextSibling;
		for (; t && Yf(t, 1);) a = t.parentNode, o = ld(t) + 1, t = t.nextSibling;
		if (t) n = t, r = 0, i = _d(n);
		else {
			if (n = n.parentNode, n == e.dom) break;
			r = i = 0;
		}
	}
	a && np(e, a, o);
}
function $f(e) {
	for (let t = e; t; t = t.parentNode) {
		let e = t.pmViewDesc;
		if (e) return e.node ? e.node.isBlock : !1;
	}
	return !1;
}
function ep(e, t) {
	for (; e && t == e.childNodes.length && !Sd(e);) t = ld(e) + 1, e = e.parentNode;
	for (; e && t < e.childNodes.length;) {
		let n = e.childNodes[t];
		if (H(n)) return n;
		if (V(n) && n.contentEditable == "false") break;
		e = n, t = 0;
	}
}
function tp(e, t) {
	for (; e && !t && !Sd(e);) t = ld(e), e = e.parentNode;
	for (; e && t;) {
		let n = e.childNodes[t - 1];
		if (H(n)) return n;
		if (V(n) && n.contentEditable == "false") break;
		e = n, t = e.childNodes.length;
	}
}
function np(e, t, n) {
	if (!H(t)) {
		let e, r;
		(r = ep(t, n)) ? (t = r, n = 0) : (e = tp(t, n)) && (t = e, n = e.nodeValue.length);
	}
	let r = e.domSelection(), i = e.domSel.readRange();
	if (!r) return;
	Cd(i) ? r.collapse(t, n) : r.extend && (r.collapse(i.anchorNode, i.anchorOffset), r.extend(t, n)), e.domSel.ignore();
	let { state: a } = e;
	setTimeout(() => {
		e.state == a && e.domSel.sync();
	}, 50);
}
function rp(e, t) {
	let n = e.state.doc.resolve(t);
	if (!(Nd || Rd) && n.parent.inlineContent) {
		let r = e.coordsAtPos(t);
		if (t > n.start()) {
			let n = e.coordsAtPos(t - 1), i = (n.top + n.bottom) / 2;
			if (i > r.top && i < r.bottom && Math.abs(n.left - r.left) > 1) return n.left < r.left ? "ltr" : "rtl";
		}
		if (t < n.end()) {
			let n = e.coordsAtPos(t + 1), i = (n.top + n.bottom) / 2;
			if (i > r.top && i < r.bottom && Math.abs(n.left - r.left) > 1) return n.left > r.left ? "ltr" : "rtl";
		}
	}
	let r = e.dom;
	for (let t = n.depth; t > 0; t--) if (n.node(t).isBlock) {
		r = e.nodeDOM(n.before(t)) || r;
		break;
	}
	return getComputedStyle(r).direction == "rtl" ? "rtl" : "ltr";
}
function ip(e, t, n) {
	let r = e.state.selection;
	if (r instanceof L && !r.empty || n.indexOf("s") > -1 || Ld && n.indexOf("m") > -1) return !1;
	let { $from: i, $to: a } = r;
	if (!i.parent.inlineContent || e.endOfTextblock(t < 0 ? "up" : "down")) {
		let n = Kf(e.state, t);
		if (n && n instanceof R) return qf(e, n);
	}
	if (!i.parent.inlineContent) {
		let n = t < 0 ? i : a, o = r instanceof nu ? I.near(n, t) : I.findFrom(n, t);
		return o ? qf(e, o) : !1;
	}
	return !1;
}
function ap(e, t) {
	if (!(e.state.selection instanceof L)) return !0;
	let { $head: n, $anchor: r, empty: i } = e.state.selection;
	if (!n.sameParent(r)) return !0;
	if (!i) return !1;
	if (e.endOfTextblock(t > 0 ? "forward" : "backward")) return !0;
	let a = !n.textOffset && (t < 0 ? n.nodeBefore : n.nodeAfter);
	if (a && !a.isText) {
		let r = e.state.tr;
		return t < 0 ? r.delete(n.pos - a.nodeSize, n.pos) : r.delete(n.pos, n.pos + a.nodeSize), e.dispatch(r), !0;
	}
	return !1;
}
function op(e, t, n) {
	e.domObserver.stopped(() => t.contentEditable = n);
}
function sp(e) {
	if (!Fd || e.state.selection.$head.parentOffset > 0) return !1;
	let { focusNode: t, focusOffset: n } = e.domSel.readRange();
	if (t && V(t) && n == 0 && t.firstChild && V(t.firstChild) && t.firstChild.contentEditable == "false") {
		let n = t.firstChild;
		op(e, n, "true"), setTimeout(() => op(e, n, "false"), 20);
	}
	return !1;
}
function cp(e) {
	let t = "";
	return e.ctrlKey && (t += "c"), e.metaKey && (t += "m"), e.altKey && (t += "a"), e.shiftKey && (t += "s"), t;
}
function lp(e, t) {
	let n = t.keyCode, r = cp(t);
	if (n == 8 || Ld && n == 72 && r == "c") return ap(e, -1) || Xf(e, -1);
	if (n == 46 && !t.shiftKey || Ld && n == 68 && r == "c") return ap(e, 1) || Xf(e, 1);
	if (n == 13 || n == 27) return !0;
	if (n == 37 || Ld && n == 66 && r == "c") {
		let t = n == 37 ? rp(e, e.state.selection.from) == "ltr" ? -1 : 1 : -1;
		return Jf(e, t, r) || Xf(e, t);
	}
	if (n == 39 || Ld && n == 70 && r == "c") {
		let t = n == 39 ? rp(e, e.state.selection.from) == "ltr" ? 1 : -1 : 1;
		return Jf(e, t, r) || Xf(e, t);
	}
	return n == 38 || Ld && n == 80 && r == "c" ? ip(e, -1, r) || Xf(e, -1) : n == 40 || Ld && n == 78 && r == "c" ? sp(e) || ip(e, 1, r) || Xf(e, 1) : !(r != (Ld ? "m" : "c") || n != 66 && n != 73 && n != 89 && n != 90);
}
function up(e, t) {
	e.someProp("transformCopied", (n) => {
		t = n(t, e);
	});
	let n = [], { content: r, openStart: i, openEnd: a } = t;
	for (; i > 1 && a > 1 && r.childCount == 1 && r.firstChild.childCount == 1;) {
		i--, a--;
		let e = r.firstChild;
		n.push(e.type.name, e.attrs == e.type.defaultAttrs ? null : e.attrs), r = e.content;
	}
	let o = e.someProp("clipboardSerializer") || Oc.fromSchema(e.state.schema), s = bp(), c = s.createElement("div");
	c.appendChild(o.serializeFragment(r, { document: s }));
	let l = c.firstChild, u, d = 0;
	for (; l && V(l) && (u = yp[l.nodeName.toLowerCase()]);) {
		for (let e = u.length - 1; e >= 0; e--) {
			let t = s.createElement(u[e]);
			for (; c.firstChild;) t.appendChild(c.firstChild);
			c.appendChild(t), d++;
		}
		l = c.firstChild;
	}
	return l && V(l) && l.setAttribute("data-pm-slice", `${i} ${a}${d ? ` -${d}` : ""} ${JSON.stringify(n)}`), {
		dom: c,
		text: e.someProp("clipboardTextSerializer", (n) => n(t, e)) || t.content.textBetween(0, t.content.size, "\n\n"),
		slice: t
	};
}
function dp(e, t, n, r, i) {
	let a = i.parent.type.spec.code, o, s;
	if (!n && !t) return null;
	let c = !!t && (r || a || !n);
	if (c) {
		if (e.someProp("transformPastedText", (n) => {
			t = n(t, a || r, e);
		}), a) return s = new P(M.from(e.state.schema.text(t.replace(/\r\n?/g, "\n"))), 0, 0), e.someProp("transformPasted", (t) => {
			s = t(s, e, !0);
		}), s;
		let n = e.someProp("clipboardTextParser", (n) => n(t, i, r, e));
		if (n) s = n;
		else {
			let n = i.marks(), { schema: r } = e.state, a = Oc.fromSchema(r);
			o = document.createElement("div"), t.split(/(?:\r\n?|\n)+/).forEach((e) => {
				let t = o.appendChild(document.createElement("p"));
				e && t.appendChild(a.serializeNode(r.text(e, n)));
			});
		}
	} else e.someProp("transformPastedHTML", (t) => {
		n = t(n, e);
	}), o = Cp(n), Bd && wp(o);
	let l = o && o.querySelector("[data-pm-slice]"), u = l && /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(l.getAttribute("data-pm-slice") || "");
	if (u && u[3]) for (let e = +u[3]; e > 0; e--) {
		let e = o.firstChild;
		for (; e && !V(e);) e = e.nextSibling;
		if (!e) break;
		o = e;
	}
	if (s ||= (e.someProp("clipboardParser") || e.someProp("domParser") || mc.fromSchema(e.state.schema)).parseSlice(o, {
		preserveWhitespace: !!(c || u),
		context: i,
		ruleFromNode(e) {
			return e.nodeName == "BR" && !e.nextSibling && e.parentNode && !fp.test(e.parentNode.nodeName) ? { ignore: !0 } : null;
		}
	}), u) s = Tp(vp(s, +u[1], +u[2]), u[4]);
	else if (s = P.maxOpen(pp(s.content, i), !0), s.openStart || s.openEnd) {
		let e = 0, t = 0;
		for (let t = s.content.firstChild; e < s.openStart && !t.type.spec.isolating; e++, t = t.firstChild);
		for (let e = s.content.lastChild; t < s.openEnd && !e.type.spec.isolating; t++, e = e.lastChild);
		s = vp(s, e, t);
	}
	return e.someProp("transformPasted", (t) => {
		s = t(s, e, r);
	}), s;
}
var fp = /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i;
function pp(e, t) {
	if (e.childCount < 2) return e;
	for (let n = t.depth; n >= 0; n--) {
		let r = t.node(n).contentMatchAt(t.index(n)), i, a = [];
		if (e.forEach((e) => {
			if (!a) return;
			let t = r.findWrapping(e.type), n;
			if (!t) return a = null;
			if (n = a.length && i.length && hp(t, i, e, a[a.length - 1], 0)) a[a.length - 1] = n;
			else {
				a.length && (a[a.length - 1] = gp(a[a.length - 1], i.length));
				let n = mp(e, t);
				a.push(n), r = r.matchType(n.type), i = t;
			}
		}), a) return M.from(a);
	}
	return e;
}
function mp(e, t, n = 0) {
	for (let r = t.length - 1; r >= n; r--) e = t[r].create(null, M.from(e));
	return e;
}
function hp(e, t, n, r, i) {
	if (i < e.length && i < t.length && e[i] == t[i]) {
		let a = hp(e, t, n, r.lastChild, i + 1);
		if (a) return r.copy(r.content.replaceChild(r.childCount - 1, a));
		if (r.contentMatchAt(r.childCount).matchType(i == e.length - 1 ? n.type : e[i + 1])) return r.copy(r.content.append(M.from(mp(n, e, i + 1))));
	}
}
function gp(e, t) {
	if (t == 0) return e;
	let n = e.content.replaceChild(e.childCount - 1, gp(e.lastChild, t - 1)), r = e.contentMatchAt(e.childCount).fillBefore(M.empty, !0);
	return e.copy(n.append(r));
}
function _p(e, t, n, r, i, a) {
	let o = t < 0 ? e.firstChild : e.lastChild, s = o.content;
	return e.childCount > 1 && (a = 0), i < r - 1 && (s = _p(s, t, n, r, i + 1, a)), i >= n && (s = t < 0 ? o.contentMatchAt(0).fillBefore(s, a <= i).append(s) : s.append(o.contentMatchAt(o.childCount).fillBefore(M.empty, !0))), e.replaceChild(t < 0 ? 0 : e.childCount - 1, o.copy(s));
}
function vp(e, t, n) {
	return t < e.openStart && (e = new P(_p(e.content, -1, t, e.openStart, 0, e.openEnd), t, e.openEnd)), n < e.openEnd && (e = new P(_p(e.content, 1, n, e.openEnd, 0, 0), e.openStart, n)), e;
}
var yp = {
	thead: ["table"],
	tbody: ["table"],
	tfoot: ["table"],
	caption: ["table"],
	colgroup: ["table"],
	col: ["table", "colgroup"],
	tr: ["table", "tbody"],
	td: [
		"table",
		"tbody",
		"tr"
	],
	th: [
		"table",
		"tbody",
		"tr"
	]
};
function bp() {
	return document.implementation.createHTMLDocument("title");
}
var xp = null;
function Sp(e) {
	let t = window.trustedTypes;
	if (!t) return e;
	if (!xp) {
		if (xp = t.defaultPolicy) try {
			return xp.createHTML(e);
		} catch {}
		xp = t.createPolicy("ProseMirrorClipboard", { createHTML: (e) => e });
	}
	return xp.createHTML(e);
}
function Cp(e) {
	let t = /^(\s*<meta [^>]*>)*/.exec(e);
	t && (e = e.slice(t[0].length));
	let n = bp(), r = n.body, i = /<([a-z][^>\s]+)/i.exec(e), a;
	if ((a = i && yp[i[1].toLowerCase()]) && (e = a.map((e) => "<" + e + ">").join("") + e + a.map((e) => "</" + e + ">").reverse().join("")), r.innerHTML = Sp(e), a) for (let e = 0; e < a.length; e++) r = r.querySelector(a[e]) || r;
	for (let e = 0; e < n.styleSheets.length; e++) {
		let t = n.styleSheets[e];
		for (let e = 0; e < t.rules.length; e++) {
			let n = t.rules[e];
			if (n instanceof CSSStyleRule) {
				let e = r.querySelectorAll(n.selectorText);
				for (let t = 0; t < e.length; t++) e[t].style.cssText += n.style.cssText;
			}
		}
	}
	return r;
}
function wp(e) {
	let t = e.querySelectorAll(Nd ? "span:not([class]):not([style])" : "span.Apple-converted-space");
	for (let n = 0; n < t.length; n++) {
		let r = t[n];
		r.childNodes.length == 1 && r.textContent == "\xA0" && r.parentNode && r.parentNode.replaceChild(e.ownerDocument.createTextNode(" "), r);
	}
}
function Tp(e, t) {
	if (!e.size) return e;
	let n = e.content.firstChild.type.schema, r;
	try {
		r = JSON.parse(t);
	} catch {
		return e;
	}
	let { content: i, openStart: a, openEnd: o } = e;
	for (let e = r.length - 2; e >= 0; e -= 2) {
		let t = n.nodes[r[e]];
		if (!t || t.hasRequiredAttrs() || !t.createAndFill(null, i)) break;
		try {
			i = M.from(t.create(r[e + 1], i));
		} catch {
			break;
		}
		a++, o++;
	}
	return new P(i, a, o);
}
var Ep = class e {
	constructor(e, t, n, r) {
		this.anchorNode = e, this.anchorOffset = t, this.focusNode = n, this.focusOffset = r;
	}
	static from(t) {
		return t instanceof e ? t : new e(t.anchorNode, t.anchorOffset, t.focusNode, t.focusOffset);
	}
	eq(e) {
		return e.anchorNode == this.anchorNode && e.anchorOffset == this.anchorOffset && e.focusNode == this.focusNode && e.focusOffset == this.focusOffset;
	}
};
Ep.null = new Ep(null, 0, null, 0);
var Dp = class {
	constructor(e) {
		this.view = e, this.range = Ep.null, this.active = !1, this.synced = !1, this.suppress = !1, this.currentDocument = null, this.onSelectionChange = this.onSelectionChange.bind(this);
	}
	ensureListener() {
		let e = this.view.dom.ownerDocument;
		e != this.currentDocument && (this.currentDocument && this.currentDocument.removeEventListener("selectionchange", this.onSelectionChange), this.currentDocument = e, e.addEventListener("selectionchange", this.onSelectionChange));
	}
	destroy() {
		this.currentDocument &&= (this.currentDocument.removeEventListener("selectionchange", this.onSelectionChange), null), this.active = !1, this.range = Ep.null;
	}
	suppressChanges() {
		this.suppress = !0, setTimeout(() => this.suppress = !1, 50);
	}
	onSelectionChange() {
		if (this.suppress && this.view.hasFocus()) return this.sync();
		this.read() && this.view.domObserver.flush(!1);
	}
	readRange() {
		let { view: e } = this, t = e.dom.isConnected !== !1 && e.domSelection();
		return t ? Fd && e.root.nodeType === 11 && Ed(e.dom.ownerDocument) == e.dom ? Ep.from(Op(e, t) || t) : Ep.from(t) : Ep.null;
	}
	read() {
		this.ensureListener();
		let e = Wp(this.view);
		if (!e) this.active = !1, this.range = Ep.null;
		else return this.active = !0, !this.range.eq(e) && (this.range = e, this.synced = !1, !0);
	}
	sync(e = !1) {
		let { view: t } = this;
		t.docView && (this.ensureListener(), t.domObserver.stopped(() => {
			Vp(t, t.state.selection);
			let n = t.state.selection;
			if (jp(t)) {
				let { desc: r, start: i } = Np(t.docView, n.from, n.to, 0);
				t.cursorWrapper ? Bp(t) : r instanceof kf && r.spec.setSelection ? r.spec.setSelection(n.anchor - i, n.head - i, t.root) : Mp(t, e, r, i), this.synced = this.active = !0;
			}
			n.visible == t.dom.classList.contains("ProseMirror-hideselection") && (n.visible ? t.dom.classList.remove("ProseMirror-hideselection") : (t.dom.classList.add("ProseMirror-hideselection"), zp(t))), this.range = this.readRange();
		}));
	}
	ignore(e = this.readRange()) {
		this.range = Ep.from(e), this.synced = !0;
	}
	deactivate() {
		this.range = Ep.null, this.active = this.synced = !1;
	}
};
function Op(e, t) {
	if (t.getComposedRanges) {
		let n = t.getComposedRanges(e.root)[0];
		if (n) return kp(e, n);
	}
	let n;
	function r(e) {
		e.preventDefault(), e.stopImmediatePropagation(), n = e.getTargetRanges()[0];
	}
	return e.dom.addEventListener("beforeinput", r, !0), document.execCommand("indent"), e.dom.removeEventListener("beforeinput", r, !0), n ? kp(e, n) : null;
}
function kp(e, t) {
	let n = t.startContainer, r = t.startOffset, i = t.endContainer, a = t.endOffset, o = e.domAtPos(e.state.selection.anchor);
	return md(o.node, o.offset, i, a) && ([n, r, i, a] = [
		i,
		a,
		n,
		r
	]), new Ep(n, r, i, a);
}
function Ap(e, t, n = null) {
	let r = e.state.doc;
	if (!t.focusNode) return null;
	let i = e.docView.nearestDesc(t.focusNode), a = i && i.size == 0, o = e.docView.posFromDOM(t.focusNode, t.focusOffset, 1);
	if (o < 0) return null;
	let s = r.resolve(o), c, l;
	if (Cd(t)) {
		for (c = o; i && !i.node;) i = i.parent;
		if (i && i.node.isAtom && R.isSelectable(i.node) && i.parent && !(i.node.isInline && xd(t.focusNode, t.focusOffset, i.dom))) {
			let e = i.posBefore;
			l = new R(o == e ? s : r.resolve(e));
		} else if (jd && n == "key" && o > e.state.selection.to && V(t.focusNode) && t.focusOffset == t.focusNode.childNodes.length && i && i.posAtStart > e.state.selection.to) for (let e = t.focusNode;; e = e.parentNode) {
			if (getComputedStyle(e).overflow != "visible") {
				l = I.findFrom(r.resolve(i.posAtStart), 1);
				break;
			}
			if (e == i.dom || e.nextSibling || !e.parentNode || !V(e.parentNode)) break;
		}
	} else {
		if (t instanceof e.dom.ownerDocument.defaultView.Selection && t.rangeCount > 1) {
			let n = o, i = o;
			for (let r = 0; r < t.rangeCount; r++) {
				let a = t.getRangeAt(r);
				n = Math.min(n, e.docView.posFromDOM(a.startContainer, a.startOffset, 1)), i = Math.max(i, e.docView.posFromDOM(a.endContainer, a.endOffset, -1));
			}
			if (n < 0) return null;
			[c, o] = i == e.state.selection.anchor ? [i, n] : [n, i], s = r.resolve(o);
		} else c = e.docView.posFromDOM(t.anchorNode, t.anchorOffset, 1);
		if (c < 0) return null;
	}
	let u = r.resolve(c);
	if (!l) {
		let t = n == "pointer" || e.state.selection.head < s.pos && !a ? 1 : -1;
		l = Up(e, u, s, t);
	}
	return l;
}
function jp(e) {
	return e.editable ? e.hasFocus() : Gp(e, e.domSel.readRange()) && (!document.activeElement || document.activeElement.contains(e.dom));
}
function Mp(e, t, n, r) {
	let i = e.state.selection, { anchor: a, head: o } = i, s, c;
	Fp && !(i instanceof L) && (i.$from.parent.inlineContent || (s = Ip(e, i.from)), !i.empty && !i.$from.parent.inlineContent && (c = Ip(e, i.to)));
	let l = n.domFromPos(a - r, a > r ? -1 : 1);
	Pp(a, o, l, o == a ? l : n.domFromPos(o - r, o > r ? -1 : 1), e, t), Fp && (s && Rp(s), c && Rp(c));
}
function Np(e, t, n, r = 0) {
	for (let i = 0, a = r; i < e.children.length; i++) {
		let r = e.children[i], o = a + r.size;
		if (t > a && n < o) return Np(r, t, n, a + r.border);
		a = o;
	}
	return {
		desc: e,
		start: r
	};
}
function Pp(e, t, n, r, i, a) {
	let o = !1;
	if ((jd || Fd) && e == t) {
		let { node: e, offset: t } = n;
		if (H(e)) {
			if (o = !!(t && e.nodeValue[t - 1] == "\n"), o && t == e.nodeValue.length) for (let t = e, i; t; t = t.parentNode) {
				if (i = t.nextSibling) {
					i.nodeName == "BR" && (n = r = {
						node: i.parentNode,
						offset: ld(i) + 1
					});
					break;
				}
				let e = t.pmViewDesc;
				if (e && e.node && e.node.isBlock) break;
			}
		} else {
			let n = e.childNodes[t - 1];
			o = n && (n.nodeName == "BR" || n.contentEditable == "false");
		}
	}
	let s = i.domSel.readRange();
	if (jd && s.focusNode && s.focusNode != r.node && V(s.focusNode)) {
		let e = s.focusNode.childNodes[s.focusOffset];
		e && e.contentEditable == "false" && (a = !0);
	}
	!(a || o && Fd) && md(n.node, n.offset, s.anchorNode, s.anchorOffset) && md(r.node, r.offset, s.focusNode, s.focusOffset) || wd(i.domSelection(), {
		focusNode: r.node,
		focusOffset: r.offset,
		anchorNode: n.node,
		anchorOffset: n.offset
	});
}
var Fp = Fd || Nd && Pd < 63;
function Ip(e, t) {
	let { node: n, offset: r } = e.docView.domFromPos(t, 0), i = r < n.childNodes.length ? n.childNodes[r] : null, a = r ? n.childNodes[r - 1] : null;
	if (Fd && i && i.contentEditable == "false") return Lp(i);
	if ((!i || i.contentEditable == "false") && (!a || a.contentEditable == "false")) {
		if (i) return Lp(i);
		if (a) return Lp(a);
	}
}
function Lp(e) {
	return e.contentEditable = "true", Fd && e.draggable && (e.draggable = !1, e.wasDraggable = !0), e;
}
function Rp(e) {
	e.contentEditable = "false", e.wasDraggable &&= (e.draggable = !0, null);
}
function zp(e) {
	let t = e.dom.ownerDocument;
	t.removeEventListener("selectionchange", e.input.hideSelectionGuard);
	let n = e.domSel.readRange(), r = n.anchorNode, i = n.anchorOffset;
	t.addEventListener("selectionchange", e.input.hideSelectionGuard = () => {
		(n.anchorNode != r || n.anchorOffset != i) && (t.removeEventListener("selectionchange", e.input.hideSelectionGuard), setTimeout(() => {
			(!jp(e) || e.state.selection.visible) && e.dom.classList.remove("ProseMirror-hideselection");
		}, 20));
	});
}
function Bp(e) {
	let t = e.domSelection();
	if (!t) return;
	let n = e.cursorWrapper.dom;
	n.nodeName == "IMG" ? t.collapse(n.parentNode, ld(n) + 1) : t.collapse(n, 0);
}
function Vp(e, t) {
	if (t instanceof R) {
		let n = e.docView.descAt(t.from);
		n != e.lastSelectedViewDesc && (Hp(e), n && n.selectNode(), e.lastSelectedViewDesc = n);
	} else Hp(e);
}
function Hp(e) {
	e.lastSelectedViewDesc &&= (e.lastSelectedViewDesc.parent && e.lastSelectedViewDesc.deselectNode(), void 0);
}
function Up(e, t, n, r) {
	let i = e.someProp("createSelectionBetween", (r) => r(e, t, n)) || L.between(t, n, r);
	return e.someProp("adjustSelectionFromDOM", (t) => {
		i = t(e, i);
	}), i;
}
function Wp(e) {
	if (e.editable && !e.hasFocus()) return null;
	let t = e.domSel.readRange();
	return t && Gp(e, t) ? t : null;
}
function Gp(e, t) {
	if (!t.anchorNode) return !1;
	try {
		return vd(e.dom, t.anchorNode) && (e.editable || vd(e.dom, t.focusNode));
	} catch {
		return !1;
	}
}
var Kp = {}, qp = {}, Jp = {
	touchstart: !0,
	touchmove: !0
}, Yp = class {
	constructor() {
		this.shiftKey = !1, this.mouseDown = null, this.lastKeyCode = null, this.lastKeyCodeTime = 0, this.lastKeyDispatched = !1, this.lastClick = {
			time: 0,
			x: 0,
			y: 0,
			type: "",
			button: 0
		}, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastIOSEnter = 0, this.lastIOSEnterFallbackTimeout = -1, this.lastFocus = 0, this.lastTouch = 0, this.lastChromeDelete = 0, this.composing = !1, this.compositionNode = null, this.composingTimeout = -1, this.compositionNodes = [], this.compositionEndedAt = -2e8, this.compositionID = 1, this.badSafariComposition = !1, this.compositionPendingChanges = 0, this.domChangeCount = 0, this.eventHandlers = Object.create(null), this.hideSelectionGuard = null;
	}
};
function Xp(e) {
	for (let t in Kp) {
		let n = Kp[t];
		e.dom.addEventListener(t, e.input.eventHandlers[t] = (t) => {
			tm(e, t) && (e.input.composing && (t.type == "keydown" || t.type == "beforeinput") && t.isComposing === !1 && wm(e, !0), em(e, t) || !e.editable && t.type in qp || n(e, t));
		}, Jp[t] ? { passive: !0 } : void 0);
	}
	Fd && e.dom.addEventListener("input", () => null), $p(e);
}
function Zp(e, t) {
	e.input.lastSelectionOrigin = t, e.input.lastSelectionTime = Date.now();
}
function Qp(e) {
	e.input.mouseDown && e.input.mouseDown.done(), e.domObserver.stop();
	for (let t in e.input.eventHandlers) e.dom.removeEventListener(t, e.input.eventHandlers[t]);
	clearTimeout(e.input.composingTimeout), clearTimeout(e.input.lastIOSEnterFallbackTimeout);
}
function $p(e) {
	e.someProp("handleDOMEvents", (t) => {
		for (let n in t) e.input.eventHandlers[n] || e.dom.addEventListener(n, e.input.eventHandlers[n] = (t) => em(e, t));
	});
}
function em(e, t) {
	return e.someProp("handleDOMEvents", (n) => {
		let r = n[t.type];
		return r ? r(e, t) || t.defaultPrevented : !1;
	});
}
function tm(e, t) {
	if (!t.bubbles) return !0;
	if (t.defaultPrevented) return !1;
	for (let n = t.target; n != e.dom; n = n.parentNode) if (!n || n.nodeType == 11 || n.pmViewDesc && n.pmViewDesc.stopEvent(t)) return !1;
	return !0;
}
function nm(e, t) {
	!em(e, t) && Kp[t.type] && (e.editable || !(t.type in qp)) && Kp[t.type](e, t);
}
function rm(e, t) {
	let { input: n } = e;
	return n.lastKeyDispatched || e.composing ? !1 : (n.lastKeyDispatched = !0, typeof t == "string" && (t = Td(t == "Backspace" ? 8 : 13, t)), e.someProp("handleKeyDown", (n) => n(e, t)));
}
qp.keydown = (e, t) => {
	let n = t;
	if (e.input.shiftKey = n.keyCode == 16 || n.shiftKey, e.input.lastKeyCode = n.keyCode, e.input.lastKeyCodeTime = Date.now(), e.input.lastKeyDispatched = !1, !(zd && Nd && n.keyCode == 13)) {
		if (Id && n.keyCode == 13 && !n.ctrlKey && !n.altKey && !n.metaKey) {
			let t = Date.now();
			e.input.lastIOSEnter = t, e.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
				e.input.lastIOSEnter == t && (rm(e, "Enter"), e.input.lastIOSEnter = 0);
			}, 200);
		} else n.keyCode != 229 && e.domObserver.forceFlush(!0), rm(e, n) || lp(e, n) ? n.preventDefault() : Zp(e, "key");
	}
}, qp.keyup = (e, t) => {
	t.keyCode == 16 && (e.input.shiftKey = !1);
}, qp.keypress = (e, t) => {
	let n = t;
	if (xm(e) || !n.charCode || n.ctrlKey && !n.altKey || Ld && n.metaKey) return;
	if (e.someProp("handleKeyPress", (t) => t(e, n))) {
		n.preventDefault();
		return;
	}
	let r = e.state.selection;
	if (!(r instanceof L) || !r.$from.sameParent(r.$to)) {
		let t = String.fromCharCode(n.charCode), i = () => e.state.tr.insertText(t).scrollIntoView();
		!/[\r\n]/.test(t) && !e.someProp("handleTextInput", (n) => n(e, r.$from.pos, r.$to.pos, t, i)) && e.dispatch(i()), n.preventDefault();
	}
};
function im(e) {
	return {
		left: e.clientX,
		top: e.clientY
	};
}
function am(e, t) {
	let n = t.x - e.clientX, r = t.y - e.clientY;
	return n * n + r * r < 100;
}
function om(e, t, n, r, i) {
	if (r == -1) return !1;
	let a = e.state.doc.resolve(r);
	for (let r = a.depth + 1; r > 0; r--) if (e.someProp(t, (t) => r > a.depth ? t(e, n, a.nodeAfter, a.before(r), i, !0) : t(e, n, a.node(r), a.before(r), i, !1))) return !0;
	return !1;
}
function sm(e, t, n) {
	if (e.focused || e.focus(), e.state.selection.eq(t)) return;
	let r = e.state.tr.setSelection(t);
	r.setMeta("pointer", !0), e.dispatch(r);
}
function cm(e, t) {
	if (t == -1) return !1;
	let n = e.state.doc.resolve(t), r = n.nodeAfter;
	return r && r.isAtom && R.isSelectable(r) ? (sm(e, new R(n)), !0) : !1;
}
function lm(e, t) {
	if (t == -1) return !1;
	let n = e.state.selection, r, i;
	n instanceof R && (r = n.node);
	let a = e.state.doc.resolve(t);
	for (let e = a.depth + 1; e > 0; e--) {
		let t = e > a.depth ? a.nodeAfter : a.node(e);
		if (R.isSelectable(t)) {
			i = r && n.$from.depth > 0 && e >= n.$from.depth && a.before(n.$from.depth + 1) == n.$from.pos ? a.before(n.$from.depth) : a.before(e);
			break;
		}
	}
	return i != null && (sm(e, R.create(e.state.doc, i)), !0);
}
function um(e, t, n, r, i) {
	return om(e, "handleClickOn", t, n, r) || e.someProp("handleClick", (n) => n(e, t, r)) || (i ? lm(e, n) : cm(e, n));
}
function dm(e, t, n, r) {
	return om(e, "handleDoubleClickOn", t, n, r) || e.someProp("handleDoubleClick", (n) => n(e, t, r));
}
function fm(e, t, n, r) {
	return om(e, "handleTripleClickOn", t, n, r) || e.someProp("handleTripleClick", (n) => n(e, t, r));
}
function pm(e, t, n) {
	if (t == -1) return e.inlineContent ? L.create(e, 0, e.content.size) : null;
	let r = e.resolve(t);
	for (let t = r.depth + 1; t > 0; t--) {
		let i = t > r.depth ? r.nodeAfter : r.node(t), a = r.before(t);
		if (i.inlineContent) return L.create(e, a + 1, a + 1 + i.content.size);
		if (n && R.isSelectable(i)) return R.create(e, a);
	}
	return null;
}
var mm = /[\w_\u00a1-\uffff]+/g;
try {
	mm = /* @__PURE__ */ RegExp("[\\p{L}\\p{N}_]+", "gu");
} catch {}
function hm(e, t) {
	let n = e.resolve(t), r = n.node(), i = "", a = t, o = t;
	for (let e = n.indexAfter(), o = !1; e > 0; e--) {
		let s = r.child(e - 1);
		if (!s.text) break;
		let c = a == t ? t - n.posAtIndex(e - 1) : s.text.length, l = c;
		for (; l > 0; l--) if (/\S/.test(s.text[l - 1])) o = !0;
		else if (o) break;
		if (i = s.text.slice(l, c) + i, a -= c - l, l || a < t - 50) break;
	}
	for (let e = n.index(), a = !1; e < r.childCount; e++) {
		let s = r.child(e);
		if (!s.text) break;
		let c = o == t ? t - n.posAtIndex(e) : 0, l = c;
		for (; l < s.text.length; l++) if (/\S/.test(s.text[l])) a = !0;
		else if (a) break;
		if (i += s.text.slice(c, l), o += l - c, l < s.text.length || o > t + 50) break;
	}
	let s = a, c = o;
	if (Intl.Segmenter) {
		for (let n of new Intl.Segmenter(void 0, { granularity: "word" }).segment(i)) if (n.isWordLike) {
			let r = n.index + a, i = r + n.segment.length;
			if (i < t) s = i;
			else if (r > t) {
				c = r;
				break;
			} else return L.create(e, r, i);
		}
	} else {
		mm.lastIndex = 0;
		for (let n; n = mm.exec(i);) {
			let r = n.index + a, i = r + n[0].length;
			if (i < t) s = i;
			else if (r > t) {
				c = r;
				break;
			} else return L.create(e, r, i);
		}
	}
	let l = i.slice(s - a, t - a), u = i.slice(t - a, c - a), d = /\S*$/.exec(l)[0].length, f = /^\S*/.exec(u)[0].length;
	if (d || f) return L.create(e, t - d, t + f);
	let p = /\s*$/.exec(l)[0].length, m = /^\s*/.exec(u)[0].length;
	return L.create(e, t - p, t + m);
}
var gm = Ld ? "metaKey" : "ctrlKey";
Kp.mousedown = (e, t) => {
	let n = t, r = Date.now();
	if (e.input.shiftKey = n.shiftKey, e.input.lastTouch > r - 500) return !1;
	Om(e);
	let i = "singleClick";
	r - e.input.lastClick.time < 500 && am(n, e.input.lastClick) && !n[gm] && e.input.lastClick.button == n.button && (e.input.lastClick.type == "singleClick" ? i = "doubleClick" : e.input.lastClick.type == "doubleClick" && (i = "tripleClick")), e.input.lastClick = {
		time: r,
		x: n.clientX,
		y: n.clientY,
		type: i,
		button: n.button
	}, e.input.mouseDown && e.input.mouseDown.done();
	let a = e.posAtCoords(im(n));
	if (a) {
		if (n.button == 0) {
			if (!e.hasFocus()) {
				Zd(e.dom);
				let t = e.root.activeElement;
				t && !t.contains(e.dom) && t.blur();
			}
			(e.input.mouseDown = new _m(e, a, n, i)).mightDrag || n.preventDefault();
		} else Zp(e, "pointer");
	}
};
var _m = class {
	constructor(e, t, n, r) {
		this.view = e, this.startPos = t, this.event = n, this.type = r, this.didMove = !1, this.lastPos = -1, this.anchorRange = null, this.startDoc = e.state.doc, this.selectNode = !!n[gm], this.extend = n.shiftKey, this.anchorDoc = this.startDoc;
		let i = vm(e);
		if (this.extend) {
			let t = e.state.selection;
			this.anchorRange = t instanceof R ? {
				from: t.from,
				to: t.to
			} : {
				from: t.anchor,
				to: t.anchor
			};
			let n = t instanceof R ? e.nodeDOM(t.from).getBoundingClientRect() : e.coordsAtPos(t.anchor);
			this.anchorOffset = {
				x: (n.left + n.right) / 2 - i.x,
				y: (n.top + n.bottom) / 2 - i.y
			};
		} else this.anchorOffset = {
			x: n.clientX - i.x,
			y: n.clientY - i.y
		};
		if (r == "singleClick") {
			let { selection: r } = e.state, i, a, o = !1;
			if (r instanceof R && r.from <= t.pos && r.to >= t.pos) a = r.from, i = r.node, o = !0;
			else if (t.inside > -1) i = e.state.doc.nodeAt(t.inside), a = t.inside;
			else {
				let n = e.state.doc.resolve(t.pos);
				i = n.parent, a = n.depth ? n.before() : -1;
			}
			if (o || a > -1 && i.type.spec.draggable && i.type.spec.selectable !== !1) {
				let t = e.docView.descAt(a)?.nodeDOM;
				this.mightDrag = {
					node: i,
					elt: t,
					pos: a,
					addAttr: !1
				}, t && !t.draggable && (this.mightDrag.addAttr = !0, e.domObserver.stopped(() => t.draggable = !0));
			} else this.mightDrag = bm(e, n);
		} else this.mightDrag = !1;
		e.root.addEventListener("mouseup", this.up = this.up.bind(this)), e.root.addEventListener("mousemove", this.move = this.move.bind(this)), this.mightDrag || this.select(this.startPos, !0);
	}
	done() {
		this.view.root.removeEventListener("mouseup", this.up), this.view.root.removeEventListener("mousemove", this.move), this.view.input.mouseDown == this && (this.view.input.mouseDown = null), typeof this.mightDrag == "object" && this.mightDrag.addAttr && this.view.domObserver.stopped(() => this.mightDrag.elt.removeAttribute("draggable"));
	}
	maybeRunHandler(e, t) {
		return (this.type == "singleClick" ? um : this.type == "doubleClick" ? dm : fm)(this.view, e.pos, e.inside, t, this.selectNode);
	}
	up(e) {
		if (this.done(), !this.view.dom.contains(e.target)) return;
		let t = this.startPos;
		this.view.state.doc != this.startDoc && (t = this.view.posAtCoords(im(e))), t && (this.didMove || this.maybeRunHandler(t, e) || this.select(t, !0), e.preventDefault());
	}
	move(e) {
		if (e.buttons == 0) this.done();
		else {
			if (!this.didMove && (Math.abs(this.event.x - e.clientX) > 8 || Math.abs(this.event.y - e.clientY) > 8) && (this.didMove = !0, this.mightDrag = !1), !this.mightDrag) {
				let t = this.view.posAtCoords(im(e));
				t && this.select(t, !1);
			}
			e.preventDefault();
		}
	}
	select(e, t) {
		if (e.pos == this.lastPos) return;
		this.lastPos = e.pos;
		let { view: n } = this, { doc: r } = n.state, i = this.type == "singleClick" ? ym(n, r, e) : this.type == "doubleClick" ? hm(r, e.pos) : pm(r, e.inside, t);
		i && (t && !this.extend ? this.anchorRange = i : (!t || this.extend) && (r.eq(this.anchorDoc) || this.restoreAnchor(), this.anchorRange && this.anchorRange.from < i.from ? i = Up(n, r.resolve(this.anchorRange.from), r.resolve(i.to)) : this.anchorRange && this.anchorRange.to > i.to && (i = Up(n, r.resolve(this.anchorRange.to), r.resolve(i.from)))), i.eq(n.state.selection) || n.dispatch(n.state.tr.setSelection(i).setMeta("pointer", !0).scrollIntoView()));
	}
	restoreAnchor() {
		let e = vm(this.view), t = this.view.posAtCoords({
			left: this.anchorOffset.x + e.x,
			top: this.anchorOffset.y + e.y
		});
		if (!t) this.anchorRange = null;
		else {
			let { doc: e } = this.view.state;
			this.anchorRange = this.type == "singleClick" ? ym(this.view, e, t) : this.type == "doubleClick" ? hm(e, t.pos) : pm(e, t.inside, !1), this.anchorDoc = this.view.state.doc;
		}
	}
};
function vm(e) {
	let t = e.dom.getBoundingClientRect();
	return {
		x: t.left - e.dom.scrollLeft,
		y: t.top - e.dom.scrollTop
	};
}
function ym(e, t, n) {
	if (n.inside > -1) {
		let e = t.nodeAt(n.inside);
		if (e.isAtom && R.isSelectable(e)) return R.create(t, n.inside);
	}
	let r = t.resolve(n.pos);
	return Up(e, r, r);
}
function bm(e, t) {
	let { selection: n } = e.state;
	if (n.empty) return !1;
	let r = e.domSelection();
	if (!r || r.rangeCount == 0) return !0;
	let i = r.getRangeAt(0).getClientRects();
	for (let e = 0; e < i.length; e++) {
		let n = i[e];
		if (n.left <= t.clientX && n.right >= t.clientX && n.top <= t.clientY && n.bottom >= t.clientY) return !0;
	}
	return !1;
}
Kp.touchstart = (e) => {
	e.input.lastTouch = Date.now(), Om(e), Zp(e, "pointer");
}, Kp.touchmove = (e) => {
	e.input.lastTouch = Date.now(), Zp(e, "pointer");
}, Kp.contextmenu = (e) => Om(e);
function xm(e, t) {
	return e.composing ? !0 : Fd && Math.abs(Date.now() - e.input.compositionEndedAt) < 500 ? (e.input.compositionEndedAt = -2e8, !0) : !1;
}
var Sm = zd ? 5e3 : -1;
qp.compositionstart = qp.compositionupdate = (e) => {
	if (!e.composing) {
		e.domObserver.flush();
		let { state: t } = e, n = t.selection.$to;
		if (t.selection instanceof L && t.selection.empty && (t.storedMarks || !n.textOffset && n.parentOffset && n.nodeBefore.marks.some((e) => e.type.spec.inclusive === !1) || Nd && Rd && Cm(e))) e.markCursor = e.state.storedMarks || n.marks(), Om(e, !0), e.markCursor = null;
		else if (Om(e, !t.selection.empty), jd && e.domSel.active && t.selection.empty && n.parentOffset && !n.textOffset && n.nodeBefore.marks.length) for (let { focusNode: t, focusOffset: n } = e.domSel.range; t && V(t) && n != 0;) {
			let r = n < 0 ? t.lastChild : t.childNodes[n - 1];
			if (!r) break;
			if (H(r)) {
				let t = e.domSelection();
				t && t.collapse(r, r.nodeValue.length);
				break;
			}
			t = r, n = -1;
		}
		e.input.composing = !0;
	}
	Tm(e, Sm);
};
function Cm(e) {
	let { focusNode: t, focusOffset: n } = e.domSel.range;
	if (!t || !V(t) || n >= t.childNodes.length) return !1;
	let r = t.childNodes[n];
	return V(r) && r.contentEditable == "false";
}
qp.compositionend = (e, t) => {
	e.composing && wm(e);
};
function wm(e, t = !1) {
	e.input.composing = !1, e.input.compositionEndedAt = Date.now(), e.input.compositionPendingChanges = e.domObserver.pendingRecords().length ? e.input.compositionID : 0, e.input.compositionNode = null, e.input.badSafariComposition ? e.domObserver.forceFlush() : e.input.compositionPendingChanges && Promise.resolve().then(() => e.domObserver.flush()), e.input.compositionID++, t ? Om(e) : Tm(e, 20);
}
function Tm(e, t) {
	clearTimeout(e.input.composingTimeout), t > -1 && (e.input.composingTimeout = setTimeout(() => Om(e), t));
}
function Em(e) {
	e.composing && (e.input.composing = !1, e.input.compositionEndedAt = Date.now());
	for (let t; t = e.input.compositionNodes.pop();) t.markParentDamage();
}
function Dm(e) {
	let t = e.domSel.range;
	if (!e.domSel.active || !t.focusNode) return null;
	let n = yd(t.focusNode, t.focusOffset), r = bd(t.focusNode, t.focusOffset);
	if (n && r && n != r) {
		let t = r.pmViewDesc, i = e.domObserver.lastChangedTextNode;
		if (n == i || r == i) return i;
		if (!t || !t.isText(r.nodeValue)) return r;
		if (e.input.compositionNode == r) {
			let e = n.pmViewDesc;
			if (e && e.isText(n.nodeValue)) return r;
		}
	}
	return n || r;
}
function Om(e, t = !1) {
	if (!(zd && e.domObserver.flushingSoon >= 0) && (e.domObserver.forceFlush(), Em(e), t || e.docView && e.docView.damage)) {
		let n = Ap(e, e.domSel.readRange()), r = e.state.selection;
		n && !n.eq(r) ? e.dispatch(e.state.tr.setSelection(n)) : (e.markCursor || t) && !r.$from.node(r.$from.sharedDepth(r.to)).inlineContent ? e.dispatch(e.state.tr.deleteSelection()) : e.updateState(e.state);
	}
}
function km(e, t) {
	if (!e.dom.parentNode) return;
	let n = e.dom.parentNode.appendChild(document.createElement("div"));
	n.appendChild(t), n.style.cssText = "position: fixed; left: -10000px; top: 10px";
	let r = getSelection(), i = document.createRange();
	i.selectNodeContents(t), e.dom.blur(), r.removeAllRanges(), r.addRange(i), setTimeout(() => {
		n.parentNode && n.parentNode.removeChild(n), e.focus();
	}, 50);
}
var Am = Id && Vd < 604;
Kp.copy = qp.cut = (e, t) => {
	let n = t, r = e.state.selection, i = n.type == "cut";
	if (r.empty) return;
	let a = Am ? null : n.clipboardData, { dom: o, text: s } = up(e, r.content());
	a ? (n.preventDefault(), a.clearData(), a.setData("text/html", o.innerHTML), a.setData("text/plain", s)) : km(e, o), i && e.dispatch(e.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
};
function jm(e) {
	return e.openStart == 0 && e.openEnd == 0 && e.content.childCount == 1 ? e.content.firstChild : null;
}
function Mm(e, t) {
	if (!e.dom.parentNode) return;
	let n = e.input.shiftKey || e.state.selection.$from.parent.type.spec.code, r = e.dom.parentNode.appendChild(document.createElement(n ? "textarea" : "div"));
	n || (r.contentEditable = "true"), r.style.cssText = "position: fixed; left: -10000px; top: 10px", r.focus();
	let i = e.input.shiftKey && e.input.lastKeyCode != 45;
	setTimeout(() => {
		e.focus(), r.parentNode && r.parentNode.removeChild(r), n ? Nm(e, r.value, null, i, t) : Nm(e, r.textContent, r.innerHTML, i, t);
	}, 50);
}
function Nm(e, t, n, r, i) {
	let a = dp(e, t, n, r, e.state.selection.$from);
	if (e.someProp("handlePaste", (t) => t(e, i, a || P.empty))) return !0;
	if (!a) return !1;
	let o = jm(a), s = o ? e.state.tr.replaceSelectionWith(o, r) : e.state.tr.replaceSelection(a);
	return e.dispatch(s.scrollIntoView().setMeta("paste", !0).setMeta("uiEvent", "paste")), !0;
}
function Pm(e) {
	let t = e.getData("text/plain") || e.getData("Text");
	if (t) return t;
	let n = e.getData("text/uri-list");
	return n ? n.replace(/\r?\n/g, " ") : "";
}
qp.paste = (e, t) => {
	let n = t;
	if (e.composing && !zd) return;
	let r = Am ? null : n.clipboardData, i = e.input.shiftKey && e.input.lastKeyCode != 45;
	r && Nm(e, Pm(r), r.getData("text/html"), i, n) ? n.preventDefault() : Mm(e, n);
};
var Fm = class {
	constructor(e, t, n) {
		this.slice = e, this.move = t, this.node = n;
	}
}, Im = Ld ? "altKey" : "ctrlKey";
function Lm(e, t) {
	let n;
	return e.someProp("dragCopies", (e) => {
		n ||= e(t);
	}), n == null ? !t[Im] : !n;
}
Kp.dragstart = (e, t) => {
	let n = t, r = e.input.mouseDown;
	if (r && r.done(), !n.dataTransfer) return;
	let i = e.state.selection, a = i.empty ? null : e.posAtCoords(im(n)), o;
	if (!(a && a.pos >= i.from && a.pos <= (i instanceof R ? i.to - 1 : i.to))) {
		if (r && typeof r.mightDrag == "object") o = R.create(e.state.doc, r.mightDrag.pos);
		else if (n.target && V(n.target)) {
			let t = e.docView.nearestDesc(n.target, !0);
			t && t.node.type.spec.draggable && t != e.docView && (o = R.create(e.state.doc, t.posBefore));
		}
	}
	let { dom: s, text: c, slice: l } = up(e, (o || e.state.selection).content());
	(!n.dataTransfer.files.length || !Nd || Pd > 120) && n.dataTransfer.clearData(), n.dataTransfer.setData(Am ? "Text" : "text/html", s.innerHTML), n.dataTransfer.effectAllowed = "copyMove", Am || n.dataTransfer.setData("text/plain", c), e.dragging = new Fm(l, Lm(e, n), o);
}, Kp.dragend = (e) => {
	let t = e.dragging;
	window.setTimeout(() => {
		e.dragging == t && (e.dragging = null);
	}, 50);
}, qp.dragover = qp.dragenter = (e, t) => t.preventDefault(), qp.drop = (e, t) => {
	try {
		Rm(e, t, e.dragging);
	} finally {
		e.dragging = null;
	}
};
function Rm(e, t, n) {
	if (!t.dataTransfer) return;
	let r = e.posAtCoords(im(t));
	if (!r) return;
	let i = e.state.doc.resolve(r.pos), a = n && n.slice;
	a ? e.someProp("transformPasted", (t) => {
		a = t(a, e, !1);
	}) : a = dp(e, Pm(t.dataTransfer), Am ? null : t.dataTransfer.getData("text/html"), !1, i);
	let o = !!(n && Lm(e, t));
	if (e.someProp("handleDrop", (n) => n(e, t, a || P.empty, o))) {
		t.preventDefault();
		return;
	}
	if (!a) return;
	t.preventDefault();
	let s = a ? kl(e.state.doc, i.pos, a) : i.pos;
	s ??= i.pos;
	let c = e.state.tr;
	if (o) {
		let { node: e } = n;
		e ? e.replace(c) : c.deleteSelection();
	}
	let l = c.mapping.map(s), u = a.openStart == 0 && a.openEnd == 0 && a.content.childCount == 1, d = c.doc;
	if (u ? c.replaceRangeWith(l, l, a.content.firstChild) : c.replaceRange(l, l, a), c.doc.eq(d)) return;
	let f = c.doc.resolve(l);
	if (u && R.isSelectable(a.content.firstChild) && f.nodeAfter && f.nodeAfter.sameMarkup(a.content.firstChild)) c.setSelection(new R(f));
	else {
		let t = c.mapping.map(s);
		c.mapping.maps[c.mapping.maps.length - 1].forEach((e, n, r, i) => t = i), c.setSelection(Up(e, f, c.doc.resolve(t)));
	}
	e.focus(), e.dispatch(c.setMeta("uiEvent", "drop"));
}
Kp.focus = (e) => {
	if (e.input.lastFocus = Date.now(), !e.focused && (e.domObserver.stopped(() => e.dom.classList.add("ProseMirror-focused")), e.focused = !0, e.domSel.read(), !e.domSel.synced)) {
		let t = e.domSel.range;
		setTimeout(() => {
			let n = e.domSel.readRange();
			n && t.eq(n) && e.domSel.sync();
		}, 20);
	}
}, Kp.blur = (e, t) => {
	let n = t;
	e.focused &&= (e.domObserver.stopped(() => e.dom.classList.remove("ProseMirror-focused")), n.relatedTarget && e.dom.contains(n.relatedTarget) && e.domSel.deactivate(), !1);
}, Kp.beforeinput = (e, t) => {
	if (zd && t.inputType == "deleteContentBackward") {
		e.domObserver.flushSoon();
		let { domChangeCount: t } = e.input;
		setTimeout(() => {
			if (e.input.domChangeCount != t || e.domObserver.pendingRecords().length || (e.dom.blur(), e.focus(), rm(e, "Backspace"))) return;
			let { $cursor: n } = e.state.selection;
			n && n.pos > 0 && e.dispatch(e.state.tr.delete(n.pos - 1, n.pos).scrollIntoView());
		}, 50);
	}
};
for (let e in qp) Kp[e] = qp[e];
function zm(e, t) {
	if (e == t) return !0;
	for (let n in e) if (e[n] !== t[n]) return !1;
	for (let n in t) if (!(n in e)) return !1;
	return !0;
}
var Bm = class {
	constructor(e) {
		this.frag = e, this.index = 0, this.off = 0;
	}
	nodeAt(e) {
		for (; this.off <= e && this.index < this.frag.childCount;) {
			let t = this.frag.child(this.index);
			if (this.off == e) return t;
			this.off += t.nodeSize, this.index++;
		}
		return null;
	}
}, Vm = class e {
	constructor(e, t) {
		this.toDOM = e, this.spec = t || Km, this.side = this.spec.side || 0;
	}
	map(e, t, n, r) {
		let { pos: i, deleted: a } = e.mapResult(t.from + r, this.side < 0 ? -1 : 1);
		return a ? null : new Wm(i - n, i - n, this);
	}
	valid() {
		return !0;
	}
	eq(t) {
		return this == t || t instanceof e && (this.spec.key && this.spec.key == t.spec.key || this.toDOM == t.toDOM && zm(this.spec, t.spec));
	}
	destroy(e) {
		this.spec.destroy && this.spec.destroy(e);
	}
}, Hm = class e {
	constructor(e, t) {
		this.attrs = e, this.spec = t || Km;
	}
	map(e, t, n, r) {
		let i = e.map(t.from + r, this.spec.inclusiveStart ? -1 : 1) - n, a = e.map(t.to + r, this.spec.inclusiveEnd ? 1 : -1) - n;
		return i >= a ? null : new Wm(i, a, this);
	}
	valid(e, t) {
		return t.from < t.to;
	}
	eq(t) {
		return this == t || t instanceof e && zm(this.attrs, t.attrs) && zm(this.spec, t.spec);
	}
	static is(t) {
		return t.type instanceof e;
	}
	destroy() {}
}, Um = class e {
	constructor(e, t) {
		this.attrs = e, this.spec = t || Km;
	}
	map(e, t, n, r) {
		let i = e.mapResult(t.from + r, 1);
		if (i.deleted) return null;
		let a = e.mapResult(t.to + r, -1);
		return a.deleted || a.pos <= i.pos ? null : new Wm(i.pos - n, a.pos - n, this);
	}
	valid(e, t, n) {
		let r = n.nodeAt(t.from);
		return !!r && !r.isText && t.from + r.nodeSize == t.to;
	}
	eq(t) {
		return this == t || t instanceof e && zm(this.attrs, t.attrs) && zm(this.spec, t.spec);
	}
	destroy() {}
}, Wm = class e {
	constructor(e, t, n) {
		this.from = e, this.to = t, this.type = n;
	}
	copy(t, n) {
		return new e(t, n, this.type);
	}
	eq(e, t = 0) {
		return this.type.eq(e.type) && this.from + t == e.from && this.to + t == e.to;
	}
	map(e, t, n) {
		return this.type.map(e, this, t, n);
	}
	static widget(t, n, r) {
		return new e(t, t, new Vm(n, r));
	}
	static inline(t, n, r, i) {
		return new e(t, n, new Hm(r, i));
	}
	static node(t, n, r, i) {
		return new e(t, n, new Um(r, i));
	}
	get spec() {
		return this.type.spec;
	}
	get inline() {
		return this.type instanceof Hm;
	}
	get widget() {
		return this.type instanceof Vm;
	}
}, Gm = [], Km = {}, U = class e {
	constructor(e, t) {
		this.local = e.length ? e : Gm, this.children = t.length ? t : Gm;
	}
	static create(e, t) {
		return t.length ? eh(t, e, 0, Km) : qm;
	}
	find(e, t, n) {
		let r = [];
		return this.findInner(e ?? 0, t ?? 1e9, r, 0, n), r;
	}
	findInner(e, t, n, r, i) {
		for (let a = 0; a < this.local.length; a++) {
			let o = this.local[a];
			if (o.from > t) break;
			o.to >= e && (!i || i(o.spec)) && n.push(o.copy(o.from + r, o.to + r));
		}
		for (let a = 0; a < this.children.length && !(this.children[a] >= t); a += 3) if (this.children[a + 1] > e) {
			let o = this.children[a] + 1;
			this.children[a + 2].findInner(e - o, t - o, n, r + o, i);
		}
	}
	map(e, t, n) {
		return this == qm || e.maps.length == 0 ? this : this.mapInner(e, t, 0, 0, n || Km);
	}
	mapInner(t, n, r, i, a) {
		let o;
		if (this.local.length) {
			let e = new Bm(n.content);
			for (let s = 0; s < this.local.length; s++) {
				let c = this.local[s].map(t, r, i);
				c && c.type.valid(n, c, e) ? (o ||= []).push(c) : a.onRemove && a.onRemove(this.local[s].spec);
			}
		}
		return this.children.length ? Ym(this.children, o || [], t, n, r, i, a) : o ? new e(o.sort(th), Gm) : qm;
	}
	add(t, n) {
		return n.length ? this == qm ? e.create(t, n) : this.addInner(t, n, 0) : this;
	}
	addInner(t, n, r) {
		let i, a = 0;
		t.forEach((e, t) => {
			let o = t + r, s;
			if (s = Qm(n, e, o)) {
				for (i ||= this.children.slice(); a < i.length && i[a] < t;) a += 3;
				i[a] == t ? i[a + 2] = i[a + 2].addInner(e, s, o + 1) : i.splice(a, 0, t, t + e.nodeSize, eh(s, e, o + 1, Km)), a += 3;
			}
		});
		let o = Xm(a ? $m(n) : n, -r).sort(th);
		if (o.length) {
			let e = new Bm(t.content);
			for (let n = 0; n < o.length; n++) o[n].type.valid(t, o[n], e) || o.splice(n--, 1);
		}
		return new e(o.length ? this.local.concat(o).sort(th) : this.local, i || this.children);
	}
	remove(e) {
		return e.length == 0 || this == qm ? this : this.removeInner(e, 0);
	}
	removeInner(t, n) {
		let r = this.children, i = this.local;
		for (let e = 0; e < r.length; e += 3) {
			let i, a = r[e] + n, o = r[e + 1] + n;
			for (let e = 0, n; e < t.length; e++) (n = t[e]) && n.from > a && n.to < o && (t[e] = null, (i ||= []).push(n));
			if (!i) continue;
			r == this.children && (r = this.children.slice());
			let s = r[e + 2].removeInner(i, a + 1);
			s == qm ? (r.splice(e, 3), e -= 3) : r[e + 2] = s;
		}
		if (i.length) {
			for (let e = 0, r; e < t.length; e++) if (r = t[e]) for (let e = 0; e < i.length; e++) i[e].eq(r, n) && (i == this.local && (i = this.local.slice()), i.splice(e--, 1));
		}
		return r == this.children && i == this.local ? this : i.length || r.length ? new e(i, r) : qm;
	}
	forChild(t, n) {
		if (this == qm) return this;
		if (n.isLeaf) return e.empty;
		let r, i, a = 0, o = this.children.length / 3;
		for (; a < o;) {
			let e = a + o >>> 1, n = e * 3, i = this.children[n];
			if (i < t) a = e + 1;
			else if (i > t) o = e;
			else {
				r = this.children[n + 2];
				break;
			}
		}
		let s = t + 1, c = s + n.content.size;
		for (let e = 0; e < this.local.length; e++) {
			let t = this.local[e];
			if (t.from < c && t.to > s && t.type instanceof Hm) {
				let e = Math.max(s, t.from) - s, n = Math.min(c, t.to) - s;
				e < n && (i ||= []).push(t.copy(e, n));
			}
		}
		if (i) {
			let t = new e(i.sort(th), Gm);
			return r ? new Jm([t, r]) : t;
		}
		return r || qm;
	}
	eq(t) {
		if (this == t) return !0;
		if (!(t instanceof e) || this.local.length != t.local.length || this.children.length != t.children.length) return !1;
		for (let e = 0; e < this.local.length; e++) if (!this.local[e].eq(t.local[e])) return !1;
		for (let e = 0; e < this.children.length; e += 3) if (this.children[e] != t.children[e] || this.children[e + 1] != t.children[e + 1] || !this.children[e + 2].eq(t.children[e + 2])) return !1;
		return !0;
	}
	locals(e) {
		return nh(this.localsInner(e));
	}
	localsInner(e) {
		if (this == qm) return Gm;
		if (e.inlineContent || !this.local.some(Hm.is)) return this.local;
		let t = [];
		for (let e = 0; e < this.local.length; e++) this.local[e].type instanceof Hm || t.push(this.local[e]);
		return t;
	}
	forEachSet(e) {
		e(this);
	}
};
U.empty = new U([], []), U.removeOverlap = nh;
var qm = U.empty, Jm = class e {
	constructor(e) {
		this.members = e;
	}
	map(t, n) {
		let r = this.members.map((e) => e.map(t, n, Km));
		return e.from(r);
	}
	forChild(t, n) {
		if (n.isLeaf) return U.empty;
		let r = [];
		for (let i = 0; i < this.members.length; i++) {
			let a = this.members[i].forChild(t, n);
			a != qm && (a instanceof e ? r = r.concat(a.members) : r.push(a));
		}
		return e.from(r);
	}
	eq(t) {
		if (!(t instanceof e) || t.members.length != this.members.length) return !1;
		for (let e = 0; e < this.members.length; e++) if (!this.members[e].eq(t.members[e])) return !1;
		return !0;
	}
	locals(e) {
		let t, n = !0;
		for (let r = 0; r < this.members.length; r++) {
			let i = this.members[r].localsInner(e);
			if (i.length) {
				if (!t) t = i;
				else {
					n &&= (t = t.slice(), !1);
					for (let e = 0; e < i.length; e++) t.push(i[e]);
				}
			}
		}
		return t ? nh(n ? t : t.sort(th)) : Gm;
	}
	static from(t) {
		switch (t.length) {
			case 0: return qm;
			case 1: return t[0];
			default: return new e(t.every((e) => e instanceof U) ? t : t.reduce((e, t) => e.concat(t instanceof U ? t : t.members), []));
		}
	}
	forEachSet(e) {
		for (let t = 0; t < this.members.length; t++) this.members[t].forEachSet(e);
	}
};
function Ym(e, t, n, r, i, a, o) {
	let s = e.slice();
	for (let e = 0, t = a; e < n.maps.length; e++) {
		let r = 0;
		n.maps[e].forEach((e, n, i, a) => {
			let o = a - i - (n - e);
			for (let i = 0; i < s.length; i += 3) {
				let a = s[i + 1];
				if (a < 0 || e > a + t - r) continue;
				let c = s[i] + t - r;
				n >= c ? s[i + 1] = e <= c ? -2 : -1 : e >= t && o && (s[i] += o, s[i + 1] += o);
			}
			r += o;
		}), t = n.maps[e].map(t, -1);
	}
	let c = !1;
	for (let t = 0; t < s.length; t += 3) if (s[t + 1] < 0) {
		if (s[t + 1] == -2) {
			c = !0, s[t + 1] = -1;
			continue;
		}
		let l = n.map(e[t] + a), u = l - i;
		if (u < 0 || u >= r.content.size) {
			c = !0;
			continue;
		}
		let d = n.map(e[t + 1] + a, -1) - i, { index: f, offset: p } = r.content.findIndex(u), m = r.maybeChild(f);
		if (m && p == u && p + m.nodeSize == d) {
			let r = s[t + 2].mapInner(n, m, l + 1, e[t] + a + 1, o);
			r == qm ? (s[t + 1] = -2, c = !0) : (s[t] = u, s[t + 1] = d, s[t + 2] = r);
		} else c = !0;
	}
	if (c) {
		let c = eh(Zm(s, e, t, n, i, a, o), r, 0, o);
		t = c.local;
		for (let e = 0; e < s.length; e += 3) s[e + 1] < 0 && (s.splice(e, 3), e -= 3);
		for (let e = 0, t = 0; e < c.children.length; e += 3) {
			let n = c.children[e];
			for (; t < s.length && s[t] < n;) t += 3;
			s.splice(t, 0, c.children[e], c.children[e + 1], c.children[e + 2]);
		}
	}
	return new U(t.sort(th), s);
}
function Xm(e, t) {
	if (!t || !e.length) return e;
	let n = [];
	for (let r = 0; r < e.length; r++) {
		let i = e[r];
		n.push(new Wm(i.from + t, i.to + t, i.type));
	}
	return n;
}
function Zm(e, t, n, r, i, a, o) {
	function s(e, t) {
		for (let a = 0; a < e.local.length; a++) {
			let s = e.local[a].map(r, i, t);
			s ? n.push(s) : o.onRemove && o.onRemove(e.local[a].spec);
		}
		for (let n = 0; n < e.children.length; n += 3) s(e.children[n + 2], e.children[n] + t + 1);
	}
	for (let n = 0; n < e.length; n += 3) e[n + 1] == -1 && s(e[n + 2], t[n] + a + 1);
	return n;
}
function Qm(e, t, n) {
	if (t.isLeaf) return null;
	let r = n + t.nodeSize, i = null;
	for (let t = 0, a; t < e.length; t++) (a = e[t]) && a.from > n && a.to < r && ((i ||= []).push(a), e[t] = null);
	return i;
}
function $m(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) e[n] != null && t.push(e[n]);
	return t;
}
function eh(e, t, n, r) {
	let i = [], a = !1;
	t.forEach((t, o) => {
		let s = Qm(e, t, o + n);
		if (s) {
			a = !0;
			let e = eh(s, t, n + o + 1, r);
			e != qm && i.push(o, o + t.nodeSize, e);
		}
	});
	let o = Xm(a ? $m(e) : e, -n).sort(th);
	if (o.length) {
		let e = new Bm(t.content);
		for (let n = 0; n < o.length; n++) o[n].type.valid(t, o[n], e) || (r.onRemove && r.onRemove(o[n].spec), o.splice(n--, 1));
	}
	return o.length || i.length ? new U(o, i) : qm;
}
function th(e, t) {
	return e.from - t.from || e.to - t.to;
}
function nh(e) {
	let t = e;
	for (let n = 0; n < t.length - 1; n++) {
		let r = t[n];
		if (r.from != r.to) for (let i = n + 1; i < t.length; i++) {
			let a = t[i];
			if (a.from == r.from) a.to != r.to && (t == e && (t = e.slice()), t[i] = a.copy(a.from, r.to), rh(t, i + 1, a.copy(r.to, a.to)));
			else {
				a.from < r.to && (t == e && (t = e.slice()), t[n] = r.copy(r.from, a.from), rh(t, i, r.copy(a.from, r.to)));
				break;
			}
		}
	}
	return t;
}
function rh(e, t, n) {
	for (; t < e.length && th(n, e[t]) > 0;) t++;
	e.splice(t, 0, n);
}
function ih(e) {
	let t = [];
	return e.someProp("decorations", (n) => {
		let r = n(e.state);
		r && r != qm && t.push(r);
	}), e.cursorWrapper && t.push(U.create(e.state.doc, [e.cursorWrapper.deco])), Jm.from(t);
}
function ah(e, t, n, r) {
	let { node: i, fromOffset: a, toOffset: o, from: s, to: c } = e.docView.parseRange(t, n), l = e.domSel.range, u, d = l.anchorNode;
	if (d && vd(e.dom, d) && (u = [{
		node: d,
		offset: l.anchorOffset
	}], Cd(l) || u.push({
		node: l.focusNode,
		offset: l.focusOffset
	})), Nd && e.input.lastKeyCode === 8) for (let e = o; e > a; e--) {
		let t = i.childNodes[e - 1], n = t.pmViewDesc;
		if (t.nodeName == "BR" && !n) {
			o = e;
			break;
		}
		if (!n || n.size) break;
	}
	let f = e.state.doc, p = e.someProp("domParser") || mc.fromSchema(e.state.schema), m = f.resolve(s), h = null, g = p.parse(i, {
		topNode: m.parent,
		topMatch: m.parent.contentMatchAt(m.index()),
		topOpen: !0,
		from: a,
		to: o,
		preserveWhitespace: m.parent.type.whitespace != "pre" || "full",
		findPositions: u,
		ruleFromNode: oh(r),
		context: m
	});
	if (u && u[0].pos != null) {
		let e = u[0].pos, t = u[1] && u[1].pos;
		t ??= e, h = {
			anchor: e + s,
			head: t + s
		};
	}
	return {
		doc: g,
		sel: h,
		from: s,
		to: c
	};
}
var oh = (e) => (t) => {
	let n = t.pmViewDesc;
	if (n) return n.parseRule(e);
	if (t.nodeName == "BR" && t.parentNode) {
		if (Fd && /^(ul|ol)$/i.test(t.parentNode.nodeName)) {
			let e = document.createElement("div");
			return e.appendChild(document.createElement("li")), { skip: e };
		}
		if (t.parentNode.lastChild == t || Fd && /^(tr|table)$/i.test(t.parentNode.nodeName)) return { ignore: !0 };
	} else if (t.nodeName == "IMG" && t.getAttribute("mark-placeholder")) return { ignore: !0 };
	return null;
}, sh = /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|img|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i;
function ch(e, t, n, r, i, a) {
	let o = e.input.compositionPendingChanges || (e.composing ? e.input.compositionID : 0);
	if (e.input.compositionPendingChanges = 0, t < 0) {
		let t = e.input.lastSelectionTime > Date.now() - 50 ? e.input.lastSelectionOrigin : null, n = Ap(e, e.domSel.range, t);
		if (n && !e.state.selection.eq(n) && e.domSel.active) {
			if (Nd && zd && e.input.lastKeyCode === 13 && Date.now() - 100 < e.input.lastKeyCodeTime && rm(e, "Enter")) return;
			let r = e.state.tr.setSelection(n);
			t == "pointer" ? r.setMeta("pointer", !0) : t == "key" && r.scrollIntoView(), o && r.setMeta("composition", o), e.dispatch(r);
		}
		return;
	}
	let s = e.state.doc.resolve(t), c = s.sharedDepth(n);
	t = s.before(c + 1), n = e.state.doc.resolve(n).after(c + 1);
	let l = e.state.selection, u = ah(e, t, n, a), d = e.state.doc, f = d.slice(u.from, u.to), p, m;
	e.input.lastKeyCode === 8 && Date.now() - 100 < e.input.lastKeyCodeTime ? (p = e.state.selection.to, m = "end") : (p = e.state.selection.from, m = "start"), e.input.lastKeyCode = null;
	let h = mh(f.content, u.doc.content, u.from, p, m);
	if (h && e.input.domChangeCount++, (Id && e.input.lastIOSEnter > Date.now() - 225 || zd) && a.some((e) => V(e) && !sh.test(e.nodeName)) && (!h || h.endA >= h.endB) && rm(e, "Enter")) {
		e.input.lastIOSEnter = 0;
		return;
	}
	if (!h) {
		if (i && l instanceof L && !l.empty && l.$head.sameParent(l.$anchor) && !e.composing && !(u.sel && u.sel.anchor != u.sel.head)) h = {
			start: l.from,
			endA: l.to,
			endB: l.to
		};
		else {
			if (u.sel) {
				let t = lh(e, e.state.doc, u.sel);
				if (t && !t.eq(e.state.selection)) {
					let n = e.state.tr.setSelection(t);
					o && n.setMeta("composition", o), e.dispatch(n);
				}
			}
			return;
		}
	}
	e.state.selection.from < e.state.selection.to && h.start == h.endB && e.state.selection instanceof L && (h.start > e.state.selection.from && h.start <= e.state.selection.from + 2 && e.state.selection.from >= u.from ? h.start = e.state.selection.from : h.endA < e.state.selection.to && h.endA >= e.state.selection.to - 2 && e.state.selection.to <= u.to && (h.endB += e.state.selection.to - h.endA, h.endA = e.state.selection.to));
	let g = u.doc.resolveNoCache(h.start - u.from), _ = u.doc.resolveNoCache(h.endB - u.from), ee = d.resolve(h.start), te = g.sameParent(_) && g.parent.inlineContent && ee.end() >= h.endA;
	if ((Id && e.input.lastIOSEnter > Date.now() - 225 && (!te || a.some((e) => e.nodeName == "DIV" || e.nodeName == "P")) || !te && fh(u.doc, g.pos, _.pos)) && rm(e, "Enter")) {
		e.input.lastIOSEnter = 0;
		return;
	}
	if (e.state.selection.anchor > h.start && (te ? h.endA > h.start && h.endB == h.start : dh(d, h.start, h.endA, g, _)) && rm(e, "Backspace")) {
		zd && Nd && e.domSel.suppressChanges();
		return;
	}
	Nd && h.endB == h.start && (e.input.lastChromeDelete = Date.now()), zd && !te && g.start() != _.start() && _.parentOffset == 0 && g.depth == _.depth && u.sel && u.sel.anchor == u.sel.head && u.sel.head == h.endA && (h.endB -= 2, _ = u.doc.resolveNoCache(h.endB - u.from), setTimeout(() => rm(e, "Enter"), 20));
	let v = h.start, y = h.endA, ne = (t) => {
		let n = t || e.state.tr.replace(v, y, u.doc.slice(h.start - u.from, h.endB - u.from));
		if (u.sel) {
			let t = lh(e, n.doc, u.sel);
			t && !(Nd && e.composing && t.empty && (h.start != h.endB || e.input.lastChromeDelete < Date.now() - 100) && (t.head == v || t.head == n.mapping.map(y) - 1)) && n.setSelection(t);
		}
		return o && n.setMeta("composition", o), n.scrollIntoView();
	}, re;
	if (te) {
		if (g.pos == _.pos) {
			let t = ne(e.state.tr.delete(v, y)), n = d.resolve(h.start).marksAcross(d.resolve(h.endA));
			n && t.ensureMarks(n), e.dispatch(t);
		} else if (h.endA == h.endB && (re = uh(g.parent.content.cut(g.parentOffset, _.parentOffset), ee.parent.content.cut(ee.parentOffset, h.endA - ee.start())))) {
			let t = ne(e.state.tr);
			re.type == "add" ? t.addMark(v, y, re.mark) : t.removeMark(v, y, re.mark), e.dispatch(t);
		} else if (g.parent.child(g.index()).isText && g.index() == _.index() - +!_.textOffset) {
			let t = g.parent.textBetween(g.parentOffset, _.parentOffset), n = () => ne(e.state.tr.insertText(t, v, y));
			e.someProp("handleTextInput", (r) => r(e, v, y, t, n)) || e.dispatch(n());
		} else e.dispatch(ne());
	} else e.dispatch(ne());
}
function lh(e, t, n) {
	return Math.max(n.anchor, n.head) > t.content.size ? null : Up(e, t.resolve(n.anchor), t.resolve(n.head));
}
function uh(e, t) {
	let n = e.firstChild.marks, r = t.firstChild.marks, i = n, a = r, o, s, c;
	for (let e = 0; e < r.length; e++) i = r[e].removeFromSet(i);
	for (let e = 0; e < n.length; e++) a = n[e].removeFromSet(a);
	if (i.length == 1 && a.length == 0) s = i[0], o = "add", c = (e) => e.mark(s.addToSet(e.marks));
	else if (i.length == 0 && a.length == 1) s = a[0], o = "remove", c = (e) => e.mark(s.removeFromSet(e.marks));
	else return null;
	let l = [];
	for (let e = 0; e < t.childCount; e++) l.push(c(t.child(e)));
	if (M.from(l).eq(e)) return {
		mark: s,
		type: o
	};
}
function dh(e, t, n, r, i) {
	if (n - t <= i.pos - r.pos || ph(r, !0, !1) < i.pos) return !1;
	let a = e.resolve(t);
	if (!r.parent.inlineContent) {
		let e = a.nodeAfter;
		return e != null && n == t + e.nodeSize;
	}
	if (a.parentOffset < a.parent.content.size || !a.parent.isTextblock) return !1;
	let o = e.resolve(ph(a, !0, !0));
	return !o.parent.isTextblock || o.pos > n || ph(o, !0, !1) < n ? !1 : r.parent.content.cut(r.parentOffset).eq(o.parent.content);
}
function fh(e, t, n) {
	let r = 0, i = 0;
	return e.nodesBetween(t, n, (e, a) => {
		e.isTextblock && a >= t && a < n ? r++ : (e.isText ? /\S/.test(e.text.slice(Math.max(0, t - a), Math.min(e.nodeSize, n - a))) : e.isLeaf) && i++;
	}), i == 0 && r == 1;
}
function ph(e, t, n) {
	let r = e.depth, i = t ? e.end() : e.pos;
	for (; r > 0 && (t || e.indexAfter(r) == e.node(r).childCount);) r--, i++, t = !1;
	if (n) {
		let t = e.node(r).maybeChild(e.indexAfter(r));
		for (; t && !t.isLeaf;) t = t.firstChild, i++;
	}
	return i;
}
function mh(e, t, n, r, i) {
	let a = e.findDiffStart(t, n), o = n + e.size, s = n + t.size;
	if (a == null) return null;
	let { a: c, b: l } = e.findDiffEnd(t, o, s);
	if (i == "end") {
		let e = Math.max(0, a - Math.min(c, l));
		r -= c + e - a;
	}
	if (c < a && o < s) {
		let e = r <= a && r >= c ? a - r : 0;
		a -= e, l = a + (l - c), c = a;
	} else if (l < a) {
		let e = r <= a && r >= l ? a - r : 0;
		a -= e, c = a + (c - l), l = a;
	}
	return {
		start: a,
		endA: c,
		endB: l
	};
}
var hh = {
	childList: !0,
	characterData: !0,
	characterDataOldValue: !0,
	attributes: !0,
	attributeOldValue: !0,
	subtree: !0
}, gh = class {
	constructor(e) {
		this.view = e, this.queue = [], this.flushingSoon = -1, this.suppressingSelectionUpdates = !1, this.lastChangedTextNode = null, this.started = !1, this.observer = new window.MutationObserver((t) => {
			for (let e = 0; e < t.length; e++) this.queue.push(t[e]);
			Fd && e.composing && t.some((e) => e.type == "childList" && e.target.nodeName == "TR") ? (e.input.badSafariComposition = !0, this.flushSoon()) : this.flush();
		});
	}
	flushSoon() {
		this.flushingSoon < 0 && (this.flushingSoon = window.setTimeout(() => {
			this.flushingSoon = -1, this.flush();
		}, 20));
	}
	forceFlush(e = !1) {
		this.flushingSoon > -1 ? (window.clearTimeout(this.flushingSoon), this.flushingSoon = -1, this.flush(!0)) : e && this.flush(!0);
	}
	start() {
		this.observer.takeRecords(), this.observer.observe(this.view.dom, hh), this.started = !0;
	}
	stop() {
		let e = this.observer.takeRecords();
		if (e.length) {
			for (let t = 0; t < e.length; t++) this.queue.push(e[t]);
			window.setTimeout(() => this.flush(), 20);
		}
		this.observer.disconnect(), this.started = !1;
	}
	stopped(e) {
		if (!this.started) return e();
		this.stop();
		try {
			return e();
		} finally {
			this.start();
		}
	}
	ignoreSelectionChange(e) {
		if (!e.focusNode) return !0;
		let t = /* @__PURE__ */ new Set(), n;
		for (let n = e.focusNode; n; n = ud(n)) t.add(n);
		for (let r = e.anchorNode; r; r = ud(r)) if (t.has(r)) {
			n = r;
			break;
		}
		let r = n && this.view.docView.nearestDesc(n);
		if (r && r.ignoreMutation({
			type: "selection",
			target: H(n) ? n.parentNode : n
		})) return this.view.domSel.ignore(e), !0;
	}
	pendingRecords() {
		for (let e of this.observer.takeRecords()) this.queue.push(e);
		return this.queue;
	}
	flush(e = !0) {
		let { view: t } = this;
		if (!t.docView || this.flushingSoon > -1) return;
		let n = this.pendingRecords();
		n.length && (this.queue = []), e && t.domSel.read();
		let r = !t.domSel.suppress && !t.domSel.synced && !!Wp(t) && !this.ignoreSelectionChange(t.domSel.range), i = -1, a = -1, o = !1, s = [];
		if (t.editable) for (let e = 0; e < n.length; e++) {
			let t = this.registerMutation(n[e], s);
			t && (i = i < 0 ? t.from : Math.min(t.from, i), a = a < 0 ? t.to : Math.max(t.to, a), t.typeOver && (o = !0));
		}
		if (s.some((e) => e.nodeName == "BR") && (t.input.lastKeyCode == 8 || t.input.lastKeyCode == 46 || Nd && (t.composing || t.input.compositionEndedAt > Date.now() - 50) && n.some((e) => e.type == "childList" && e.removedNodes.length))) {
			for (let e of s) if (e.nodeName == "BR" && e.parentNode) {
				let t = e.nextSibling;
				for (; t && V(t);) {
					if (t.contentEditable == "false") {
						e.parentNode.removeChild(e);
						break;
					}
					t = t.firstChild;
				}
			}
		} else if (jd && s.length) {
			let e = s.filter((e) => e.nodeName == "BR");
			if (e.length == 2) {
				let [t, n] = e;
				t.parentNode && t.parentNode.parentNode == n.parentNode ? n.remove() : t.remove();
			} else {
				let { focusNode: n } = t.domSel.range;
				for (let r of e) {
					let e = r.parentNode;
					e && e.nodeName == "LI" && (!n || bh(t, n) != e) && r.remove();
				}
			}
		}
		let c = null;
		i < 0 && r && t.domSel.active && t.input.lastFocus > Date.now() - 200 && Math.max(t.input.lastTouch, t.input.lastClick.time) < Date.now() - 300 && Cd(t.domSel.range) && (c = Ap(t, t.domSel.range)) && c.eq(I.near(t.state.doc.resolve(0), 1)) ? (t.input.lastFocus = 0, t.domSel.sync(), t.scrollToSelection()) : (i > -1 || r) && (i > -1 && yh(t), t.input.badSafariComposition && (t.input.badSafariComposition = !1, xh(t, s)), ch(this.view, i, a, r, o, s), t.docView && t.docView.damage ? t.updateState(t.state) : r && t.domSel.sync());
	}
	registerMutation(e, t) {
		if (t.indexOf(e.target) > -1) return null;
		let n;
		for (let t = e.target; t && !(n = this.view.docView.getDesc(t)); t = t.parentNode);
		if (e.type == "attributes" && (n == this.view.docView || e.attributeName == "contenteditable" || e.attributeName == "style" && !e.oldValue && !e.target.getAttribute("style")) || !n || n.ignoreMutation(e)) return null;
		if (e.type == "childList") {
			for (let n = 0; n < e.addedNodes.length; n++) {
				let r = e.addedNodes[n];
				t.push(r), H(r) && (this.lastChangedTextNode = r);
			}
			if (n.contentDOM && n.contentDOM != n.dom && !n.contentDOM.contains(e.target)) return n.markDamage(4), {
				from: n.posBefore,
				to: n.posAfter
			};
			let r = e.previousSibling, i = e.nextSibling, a = r && r.parentNode == e.target ? ld(r) + 1 : 0, o = n.localPosFromDOM(e.target, a, -1), s = i && i.parentNode == e.target ? ld(i) : e.target.childNodes.length, c = n.localPosFromDOM(e.target, s, 1);
			return n.markDamage(n.contentDOM?.contains(e.target) ? 2 : 4), {
				from: o,
				to: c
			};
		}
		return e.type == "attributes" ? (n.markDamage(4), {
			from: n.posAtStart - n.border,
			to: n.posAtEnd + n.border
		}) : (this.lastChangedTextNode = e.target, n.markDamage(n instanceof Df && e.target == n.nodeDOM ? 8 : 4), {
			from: n.posAtStart,
			to: n.posAtEnd,
			typeOver: e.target.nodeValue == e.oldValue
		});
	}
}, _h = /* @__PURE__ */ new WeakMap(), vh = !1;
function yh(e) {
	if (!_h.has(e) && (_h.set(e, null), [
		"normal",
		"nowrap",
		"pre-line"
	].indexOf(getComputedStyle(e.dom).whiteSpace) !== -1)) {
		if (e.requiresGeckoHackNode = jd, vh) return;
		console.warn("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package."), vh = !0;
	}
}
function bh(e, t) {
	for (let n = t.parentNode; n && n != e.dom; n = n.parentNode) {
		let t = e.docView.nearestDesc(n, !0);
		if (t && t.node.isBlock) return n;
	}
	return null;
}
function xh(e, t) {
	let { focusNode: n, focusOffset: r } = e.domSel.range;
	for (let i of t) if (i.parentNode?.nodeName == "TR") {
		let t = i.nextSibling;
		for (; t && t.nodeName != "TD" && t.nodeName != "TH";) t = t.nextSibling;
		if (t) {
			let a = t;
			for (;;) {
				let e = a.firstChild;
				if (!e || !V(e) || e.contentEditable == "false" || /^(BR|IMG)$/.test(e.nodeName)) break;
				a = e;
			}
			a.insertBefore(i, a.firstChild), n == i && e.domSelection().collapse(i, r);
		} else i.parentNode.removeChild(i);
	}
}
var Sh = class {
	constructor(e, t) {
		this._root = null, this.focused = !1, this.trackWrites = null, this.mounted = !1, this.markCursor = null, this.cursorWrapper = null, this.lastSelectedViewDesc = void 0, this.input = new Yp(), this.prevDirectPlugins = [], this.pluginViews = [], this.requiresGeckoHackNode = !1, this.dragging = null, this._props = t, this.state = t.state, this.directPlugins = t.plugins || [], this.directPlugins.forEach(kh), this.dispatch = this.dispatch.bind(this), this.dom = e && e.mount || document.createElement("div"), e && (e.appendChild ? e.appendChild(this.dom) : typeof e == "function" ? e(this.dom) : e.mount && (this.mounted = !0)), this.editable = Th(this), wh(this), this.nodeViews = Dh(this), this.docView = Ef(this.state.doc, Ch(this), ih(this), this.dom, this), this.domObserver = new gh(this), this.domSel = new Dp(this), this.domObserver.start(), this.domSel.read(), Xp(this), this.updatePluginViews();
	}
	get composing() {
		return this.input.composing;
	}
	get props() {
		if (this._props.state != this.state) {
			let e = this._props;
			this._props = {};
			for (let t in e) this._props[t] = e[t];
			this._props.state = this.state;
		}
		return this._props;
	}
	update(e) {
		e.handleDOMEvents != this._props.handleDOMEvents && $p(this);
		let t = this._props;
		this._props = e, e.plugins && (e.plugins.forEach(kh), this.directPlugins = e.plugins), this.updateStateInner(e.state, t);
	}
	setProps(e) {
		let t = {};
		for (let e in this._props) t[e] = this._props[e];
		t.state = this.state;
		for (let n in e) t[n] = e[n];
		this.update(t);
	}
	updateState(e) {
		this.updateStateInner(e, this._props);
	}
	updateStateInner(e, t) {
		let n = this.state, r = !1, i = !1;
		e.storedMarks && this.composing && (Em(this), i = !0), this.state = e;
		let a = n.plugins != e.plugins || this._props.plugins != t.plugins;
		if (a || this._props.plugins != t.plugins || this._props.nodeViews != t.nodeViews) {
			let e = Dh(this);
			Oh(e, this.nodeViews) && (this.nodeViews = e, r = !0);
		}
		(a || t.handleDOMEvents != this._props.handleDOMEvents) && $p(this), this.editable = Th(this), wh(this);
		let o = ih(this), s = Ch(this), c = n.plugins != e.plugins && !n.doc.eq(e.doc) ? "reset" : e.scrollToSelection > n.scrollToSelection ? "to selection" : "preserve", l = r || !this.docView.matchesNode(e.doc, s, o);
		(l || !e.selection.eq(n.selection)) && (i = !0);
		let u = c == "preserve" && i && this.dom.style.overflowAnchor == null && Kd(this);
		i && this.domObserver.stopped(() => {
			let t = l && Nd && !this.composing && !n.selection.empty && !e.selection.empty && Eh(n.selection, e.selection);
			if (l) {
				let n = Nd ? this.trackWrites = this.domSel.range.focusNode : null;
				if (this.composing && (this.input.compositionNode = Dm(this)), r || !this.docView.update(e.doc, s, o, this, -1)) {
					let t = this.docView.outerDeco;
					this.docView.destroy(), this.docView = Ef(e.doc, s, o, this.dom, this, t);
				}
				!n || this.trackWrites && this.dom.contains(this.trackWrites) || (t = !0);
			}
			this.domSel.sync(t);
		}), this.updatePluginViews(n), this.dragging?.node && !n.doc.eq(e.doc) && this.updateDraggedNode(this.dragging, n), c == "reset" ? this.dom.scrollTop = 0 : c == "to selection" ? this.scrollToSelection() : u && Jd(u);
	}
	scrollToSelection() {
		let e = this.domSel.range.focusNode;
		if (e && this.domSel.active && !this.someProp("handleScrollToSelection", (e) => e(this))) {
			if (this.state.selection instanceof R) {
				let t = this.docView.domAfterPos(this.state.selection.from);
				V(t) && Gd(this, t.getBoundingClientRect(), e);
			} else Gd(this, this.coordsAtPos(this.state.selection.head, 1), e);
		}
	}
	destroyPluginViews() {
		let e;
		for (; e = this.pluginViews.pop();) e.destroy && e.destroy();
	}
	updatePluginViews(e) {
		if (!e || e.plugins != this.state.plugins || this.directPlugins != this.prevDirectPlugins) {
			this.prevDirectPlugins = this.directPlugins, this.destroyPluginViews();
			for (let e = 0; e < this.directPlugins.length; e++) {
				let t = this.directPlugins[e];
				t.spec.view && this.pluginViews.push(t.spec.view(this));
			}
			for (let e = 0; e < this.state.plugins.length; e++) {
				let t = this.state.plugins[e];
				t.spec.view && this.pluginViews.push(t.spec.view(this));
			}
		} else for (let t = 0; t < this.pluginViews.length; t++) {
			let n = this.pluginViews[t];
			n.update && n.update(this, e);
		}
	}
	updateDraggedNode(e, t) {
		let n = e.node, r = -1;
		if (n.from < this.state.doc.content.size && this.state.doc.nodeAt(n.from) == n.node) r = n.from;
		else {
			let e = n.from + (this.state.doc.content.size - t.doc.content.size);
			(e > 0 && e < this.state.doc.content.size && this.state.doc.nodeAt(e)) == n.node && (r = e);
		}
		this.dragging = new Fm(e.slice, e.move, r < 0 ? void 0 : R.create(this.state.doc, r));
	}
	someProp(e, t) {
		let n = this._props && this._props[e], r;
		if (n != null && (r = t ? t(n) : n)) return r;
		for (let n = 0; n < this.directPlugins.length; n++) {
			let i = this.directPlugins[n].props[e];
			if (i != null && (r = t ? t(i) : i)) return r;
		}
		let i = this.state.plugins;
		if (i) for (let n = 0; n < i.length; n++) {
			let a = i[n].props[e];
			if (a != null && (r = t ? t(a) : a)) return r;
		}
	}
	hasFocus() {
		return this.root.activeElement == this.dom;
	}
	focus() {
		this.editable && Zd(this.dom), this.domSel.sync();
	}
	get root() {
		let e = this.dom.isConnected !== !1;
		e || (this._root = null);
		let t = this._root;
		if (t == null && e) {
			for (let e = this.dom.parentNode; e; e = e.parentNode) if (e.nodeType == 9 || e.nodeType == 11 && e.host) return e.getSelection || (Object.getPrototypeOf(e).getSelection = () => e.ownerDocument.getSelection()), this._root = e;
		}
		return t || document;
	}
	updateRoot() {
		this._root = null;
	}
	posAtCoords(e) {
		return of(this, e);
	}
	coordsAtPos(e, t = 1) {
		return uf(this, e, t);
	}
	domAtPos(e, t = 0) {
		return this.docView.domFromPos(e, t);
	}
	nodeDOM(e) {
		let t = this.docView.descAt(e);
		return t ? t.nodeDOM : null;
	}
	posAtDOM(e, t, n = -1) {
		let r = this.docView.posFromDOM(e, t, n);
		if (r == null) throw RangeError("DOM position not inside the editor");
		return r;
	}
	endOfTextblock(e, t) {
		return bf(this, t || this.state, e);
	}
	pasteHTML(e, t) {
		return Nm(this, "", e, !1, t || new ClipboardEvent("paste"));
	}
	pasteText(e, t) {
		return Nm(this, e, null, !0, t || new ClipboardEvent("paste"));
	}
	serializeForClipboard(e) {
		return up(this, e);
	}
	destroy() {
		this.docView && (Qp(this), this.domSel.destroy(), this.destroyPluginViews(), this.mounted ? (this.docView.update(this.state.doc, [], ih(this), this, -1), this.dom.textContent = "") : this.dom.parentNode && this.dom.parentNode.removeChild(this.dom), this.docView.destroy(), this.docView = null, pd());
	}
	get isDestroyed() {
		return this.docView == null;
	}
	dispatchEvent(e) {
		return nm(this, e);
	}
	domSelection() {
		return this.root.getSelection();
	}
};
Sh.prototype.dispatch = function(e) {
	let t = this._props.dispatchTransaction;
	t ? t.call(this, e) : this.updateState(this.state.apply(e));
};
function Ch(e) {
	let t = Object.create(null);
	return t.class = "ProseMirror", t.contenteditable = String(e.editable), e.someProp("attributes", (n) => {
		if (typeof n == "function" && (n = n(e.state)), n) for (let e in n) e == "class" ? t.class += " " + n[e] : e == "style" ? t.style = (t.style ? t.style + ";" : "") + n[e] : !t[e] && e != "contenteditable" && e != "nodeName" && (t[e] = String(n[e]));
	}), t.translate ||= "no", [Wm.node(0, e.state.doc.content.size, t)];
}
function wh(e) {
	if (e.markCursor) {
		let t = document.createElement("img");
		t.className = "ProseMirror-separator", t.setAttribute("mark-placeholder", "true"), t.setAttribute("alt", ""), e.cursorWrapper = {
			dom: t,
			deco: Wm.widget(e.state.selection.from, t, {
				raw: !0,
				marks: e.markCursor
			})
		};
	} else e.cursorWrapper = null;
}
function Th(e) {
	return !e.someProp("editable", (t) => t(e.state) === !1);
}
function Eh(e, t) {
	let n = Math.min(e.$anchor.sharedDepth(e.head), t.$anchor.sharedDepth(t.head));
	return e.$anchor.start(n) != t.$anchor.start(n);
}
function Dh(e) {
	let t = Object.create(null);
	function n(e) {
		for (let n in e) Object.prototype.hasOwnProperty.call(t, n) || (t[n] = e[n]);
	}
	return e.someProp("nodeViews", n), e.someProp("markViews", n), t;
}
function Oh(e, t) {
	let n = 0, r = 0;
	for (let r in e) {
		if (e[r] != t[r]) return !0;
		n++;
	}
	for (let e in t) r++;
	return n != r;
}
function kh(e) {
	if (e.spec.state || e.spec.filterTransaction || e.spec.appendTransaction) throw RangeError("Plugins passed directly to the view must not have a state component");
}
for (var Ah = {
	8: "Backspace",
	9: "Tab",
	10: "Enter",
	12: "NumLock",
	13: "Enter",
	16: "Shift",
	17: "Control",
	18: "Alt",
	20: "CapsLock",
	27: "Escape",
	32: " ",
	33: "PageUp",
	34: "PageDown",
	35: "End",
	36: "Home",
	37: "ArrowLeft",
	38: "ArrowUp",
	39: "ArrowRight",
	40: "ArrowDown",
	44: "PrintScreen",
	45: "Insert",
	46: "Delete",
	59: ";",
	61: "=",
	91: "Meta",
	92: "Meta",
	106: "*",
	107: "+",
	108: ",",
	109: "-",
	110: ".",
	111: "/",
	144: "NumLock",
	145: "ScrollLock",
	160: "Shift",
	161: "Shift",
	162: "Control",
	163: "Control",
	164: "Alt",
	165: "Alt",
	173: "-",
	186: ";",
	187: "=",
	188: ",",
	189: "-",
	190: ".",
	191: "/",
	192: "`",
	219: "[",
	220: "\\",
	221: "]",
	222: "'"
}, jh = {
	48: ")",
	49: "!",
	50: "@",
	51: "#",
	52: "$",
	53: "%",
	54: "^",
	55: "&",
	56: "*",
	57: "(",
	59: ":",
	61: "+",
	173: "_",
	186: ":",
	187: "+",
	188: "<",
	189: "_",
	190: ">",
	191: "?",
	192: "~",
	219: "{",
	220: "|",
	221: "}",
	222: "\""
}, Mh = typeof navigator < "u" && /Mac/.test(navigator.platform), Nh = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent), Ph = 0; Ph < 10; Ph++) Ah[48 + Ph] = Ah[96 + Ph] = String(Ph);
for (var Ph = 1; Ph <= 24; Ph++) Ah[Ph + 111] = "F" + Ph;
for (var Ph = 65; Ph <= 90; Ph++) Ah[Ph] = String.fromCharCode(Ph + 32), jh[Ph] = String.fromCharCode(Ph);
for (var Fh in Ah) jh.hasOwnProperty(Fh) || (jh[Fh] = Ah[Fh]);
function Ih(e) {
	var t = !(Mh && e.metaKey && e.shiftKey && !e.ctrlKey && !e.altKey || Nh && e.shiftKey && e.key && e.key.length == 1 || e.key == "Unidentified") && e.key || (e.shiftKey ? jh : Ah)[e.keyCode] || e.key || "Unidentified";
	return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
// node_modules/prosemirror-keymap/dist/index.js
var Lh = typeof navigator < "u" && /Mac|iP(hone|[oa]d)/.test(navigator.platform), Rh = typeof navigator < "u" && /Win/.test(navigator.platform);
function zh(e) {
	let t = e.split(/-(?!$)/), n = t[t.length - 1];
	n == "Space" && (n = " ");
	let r, i, a, o;
	for (let e = 0; e < t.length - 1; e++) {
		let n = t[e];
		if (/^(cmd|meta|m)$/i.test(n)) o = !0;
		else if (/^a(lt)?$/i.test(n)) r = !0;
		else if (/^(c|ctrl|control)$/i.test(n)) i = !0;
		else if (/^s(hift)?$/i.test(n)) a = !0;
		else if (/^mod$/i.test(n)) Lh ? o = !0 : i = !0;
		else throw Error("Unrecognized modifier name: " + n);
	}
	return r && (n = "Alt-" + n), i && (n = "Ctrl-" + n), o && (n = "Meta-" + n), a && (n = "Shift-" + n), n;
}
function Bh(e) {
	let t = Object.create(null);
	for (let n in e) t[zh(n)] = e[n];
	return t;
}
function Vh(e, t, n = !0) {
	return t.altKey && (e = "Alt-" + e), t.ctrlKey && (e = "Ctrl-" + e), t.metaKey && (e = "Meta-" + e), n && t.shiftKey && (e = "Shift-" + e), e;
}
function Hh(e) {
	return new z({ props: { handleKeyDown: Uh(e) } });
}
function Uh(e) {
	let t = Bh(e);
	return function(e, n) {
		let r = Ih(n), i, a = t[Vh(r, n)];
		if (a && a(e.state, e.dispatch, e)) return !0;
		if (r.length == 1 && r != " ") {
			if (n.shiftKey) {
				let i = t[Vh(r, n, !1)];
				if (i && i(e.state, e.dispatch, e)) return !0;
			}
			if ((n.altKey || n.metaKey || n.ctrlKey) && !(Rh && n.ctrlKey && n.altKey) && (i = Ah[n.keyCode]) && i != r) {
				let r = t[Vh(i, n)];
				if (r && r(e.state, e.dispatch, e)) return !0;
			}
		}
		return !1;
	};
}
// node_modules/rope-sequence/dist/index.js
var Wh = 200, Gh = function() {};
Gh.prototype.append = function(e) {
	return e.length ? (e = Gh.from(e), !this.length && e || e.length < Wh && this.leafAppend(e) || this.length < Wh && e.leafPrepend(this) || this.appendInner(e)) : this;
}, Gh.prototype.prepend = function(e) {
	return e.length ? Gh.from(e).append(this) : this;
}, Gh.prototype.appendInner = function(e) {
	return new qh(this, e);
}, Gh.prototype.slice = function(e, t) {
	return e === void 0 && (e = 0), t === void 0 && (t = this.length), e >= t ? Gh.empty : this.sliceInner(Math.max(0, e), Math.min(this.length, t));
}, Gh.prototype.get = function(e) {
	if (!(e < 0 || e >= this.length)) return this.getInner(e);
}, Gh.prototype.forEach = function(e, t, n) {
	t === void 0 && (t = 0), n === void 0 && (n = this.length), t <= n ? this.forEachInner(e, t, n, 0) : this.forEachInvertedInner(e, t, n, 0);
}, Gh.prototype.map = function(e, t, n) {
	t === void 0 && (t = 0), n === void 0 && (n = this.length);
	var r = [];
	return this.forEach(function(t, n) {
		return r.push(e(t, n));
	}, t, n), r;
}, Gh.from = function(e) {
	return e instanceof Gh ? e : e && e.length ? new Kh(e) : Gh.empty;
};
var Kh = /* @__PURE__ */ function(e) {
	function t(t) {
		e.call(this), this.values = t;
	}
	e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t;
	var n = {
		length: { configurable: !0 },
		depth: { configurable: !0 }
	};
	return t.prototype.flatten = function() {
		return this.values;
	}, t.prototype.sliceInner = function(e, n) {
		return e == 0 && n == this.length ? this : new t(this.values.slice(e, n));
	}, t.prototype.getInner = function(e) {
		return this.values[e];
	}, t.prototype.forEachInner = function(e, t, n, r) {
		for (var i = t; i < n; i++) if (e(this.values[i], r + i) === !1) return !1;
	}, t.prototype.forEachInvertedInner = function(e, t, n, r) {
		for (var i = t - 1; i >= n; i--) if (e(this.values[i], r + i) === !1) return !1;
	}, t.prototype.leafAppend = function(e) {
		if (this.length + e.length <= Wh) return new t(this.values.concat(e.flatten()));
	}, t.prototype.leafPrepend = function(e) {
		if (this.length + e.length <= Wh) return new t(e.flatten().concat(this.values));
	}, n.length.get = function() {
		return this.values.length;
	}, n.depth.get = function() {
		return 0;
	}, Object.defineProperties(t.prototype, n), t;
}(Gh);
Gh.empty = new Kh([]);
var qh = /* @__PURE__ */ function(e) {
	function t(t, n) {
		e.call(this), this.left = t, this.right = n, this.length = t.length + n.length, this.depth = Math.max(t.depth, n.depth) + 1;
	}
	return e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t, t.prototype.flatten = function() {
		return this.left.flatten().concat(this.right.flatten());
	}, t.prototype.getInner = function(e) {
		return e < this.left.length ? this.left.get(e) : this.right.get(e - this.left.length);
	}, t.prototype.forEachInner = function(e, t, n, r) {
		var i = this.left.length;
		if (t < i && this.left.forEachInner(e, t, Math.min(n, i), r) === !1 || n > i && this.right.forEachInner(e, Math.max(t - i, 0), Math.min(this.length, n) - i, r + i) === !1) return !1;
	}, t.prototype.forEachInvertedInner = function(e, t, n, r) {
		var i = this.left.length;
		if (t > i && this.right.forEachInvertedInner(e, t - i, Math.max(n, i) - i, r + i) === !1 || n < i && this.left.forEachInvertedInner(e, Math.min(t, i), n, r) === !1) return !1;
	}, t.prototype.sliceInner = function(e, t) {
		if (e == 0 && t == this.length) return this;
		var n = this.left.length;
		return t <= n ? this.left.slice(e, t) : e >= n ? this.right.slice(e - n, t - n) : this.left.slice(e, n).append(this.right.slice(0, t - n));
	}, t.prototype.leafAppend = function(e) {
		var n = this.right.leafAppend(e);
		if (n) return new t(this.left, n);
	}, t.prototype.leafPrepend = function(e) {
		var n = this.left.leafPrepend(e);
		if (n) return new t(n, this.right);
	}, t.prototype.appendInner = function(e) {
		return this.left.depth >= Math.max(this.right.depth, e.depth) + 1 ? new t(this.left, new t(this.right, e)) : new t(this, e);
	}, t;
}(Gh), Jh = 500, Yh = class e {
	constructor(e, t) {
		this.items = e, this.eventCount = t;
	}
	popEvent(t, n) {
		if (this.eventCount == 0) return null;
		let r = this.items.length;
		for (;; r--) if (this.items.get(r - 1).selection) {
			--r;
			break;
		}
		let i, a;
		n && (i = this.remapping(r, this.items.length), a = i.maps.length);
		let o = t.tr, s, c, l = [], u = [];
		return this.items.forEach((t, n) => {
			if (!t.step) i || (i = this.remapping(r, n + 1), a = i.maps.length), a--, u.push(t);
			else {
				if (i) {
					u.push(new Zh(t.map));
					let e = t.step.map(i.slice(a)), n;
					e && o.maybeStep(e).doc && (n = o.mapping.maps[o.mapping.maps.length - 1], l.push(new Zh(n, void 0, void 0, l.length + u.length))), a--, n && i.appendMap(n, a);
				} else o.maybeStep(t.step);
				if (t.selection) return s = i ? t.selection.map(i.slice(a)) : t.selection, c = new e(this.items.slice(0, r).append(u.reverse().concat(l)), this.eventCount - 1), !1;
			}
		}, this.items.length, 0), {
			remaining: c,
			transform: o,
			selection: s
		};
	}
	addTransform(t, n, r, i) {
		let a = [], o = this.eventCount, s = this.items, c = !i && s.length ? s.get(s.length - 1) : null;
		for (let e = 0; e < t.steps.length; e++) {
			let r = t.steps[e].invert(t.docs[e]), l = new Zh(t.mapping.maps[e], r, n), u;
			(u = c && c.merge(l)) && (l = u, e ? a.pop() : s = s.slice(0, s.length - 1)), a.push(l), n &&= (o++, void 0), i || (c = l);
		}
		let l = o - r.depth;
		return l > $h && (s = Xh(s, l), o -= l), new e(s.append(a), o);
	}
	remapping(e, t) {
		let n = new Kc();
		return this.items.forEach((t, r) => {
			let i = t.mirrorOffset != null && r - t.mirrorOffset >= e ? n.maps.length - t.mirrorOffset : void 0;
			n.appendMap(t.map, i);
		}, e, t), n;
	}
	addMaps(t) {
		return this.eventCount == 0 ? this : new e(this.items.append(t.map((e) => new Zh(e))), this.eventCount);
	}
	rebased(t, n) {
		if (!this.eventCount) return this;
		n = Math.min(this.items.length, n);
		let r = [], i = this.items.length - n, a = t.mapping, o = t.steps.length, s = this.eventCount;
		this.items.forEach((e) => {
			e.selection && s--;
		}, i);
		let c = n;
		this.items.forEach((e) => {
			let n = a.getMirror(--c);
			if (n == null) return;
			o = Math.min(o, n);
			let i = a.maps[n];
			if (e.step) {
				let o = t.steps[n].invert(t.docs[n]), l = e.selection && e.selection.map(a.slice(c + 1, n));
				l && s++, r.push(new Zh(i, o, l));
			} else r.push(new Zh(i));
		}, i);
		let l = [];
		for (let e = n; e < o; e++) l.push(new Zh(a.maps[e]));
		let u = this.items.slice(0, i).append(l).append(r), d = new e(u, s);
		return d.emptyItemCount() > Jh && (d = d.compress(this.items.length - r.length)), d;
	}
	emptyItemCount() {
		let e = 0;
		return this.items.forEach((t) => {
			t.step || e++;
		}), e;
	}
	compress(t = this.items.length) {
		let n = this.remapping(0, t), r = n.maps.length, i = [], a = 0;
		return this.items.forEach((e, o) => {
			if (o >= t) i.push(e), e.selection && a++;
			else if (e.step) {
				let t = e.step.map(n.slice(r)), o = t && t.getMap();
				if (r--, o && n.appendMap(o, r), t) {
					let s = e.selection && e.selection.map(n.slice(r));
					s && a++;
					let c = new Zh(o.invert(), t, s), l, u = i.length - 1;
					(l = i.length && i[u].merge(c)) ? i[u] = l : i.push(c);
				}
			} else e.map && r--;
		}, this.items.length, 0), new e(Gh.from(i.reverse()), a);
	}
};
Yh.empty = new Yh(Gh.empty, 0);
function Xh(e, t) {
	let n;
	return e.forEach((e, r) => {
		if (e.selection && t-- == 0) return n = r, !1;
	}), e.slice(n);
}
var Zh = class e {
	constructor(e, t, n, r) {
		this.map = e, this.step = t, this.selection = n, this.mirrorOffset = r;
	}
	merge(t) {
		if (this.step && t.step && !t.selection) {
			let n = t.step.merge(this.step);
			if (n) return new e(n.getMap().invert(), n, this.selection);
		}
	}
}, Qh = class {
	constructor(e, t, n, r, i) {
		this.done = e, this.undone = t, this.prevRanges = n, this.prevTime = r, this.prevComposition = i;
	}
}, $h = 20;
function eg(e, t, n, r) {
	let i = n.getMeta(ug), a;
	if (i) return i.historyState;
	n.getMeta(dg) && (e = new Qh(e.done, e.undone, null, 0, -1));
	let o = n.getMeta("appendedTransaction");
	if (n.steps.length == 0) return e;
	if (o && o.getMeta(ug)) return o.getMeta(ug).redo ? new Qh(e.done.addTransform(n, void 0, r, cg(t)), e.undone, ng(n.mapping.maps), e.prevTime, e.prevComposition) : new Qh(e.done, e.undone.addTransform(n, void 0, r, cg(t)), null, e.prevTime, e.prevComposition);
	if (n.getMeta("addToHistory") !== !1 && !(o && o.getMeta("addToHistory") === !1)) {
		let i = n.getMeta("composition"), a = e.prevTime == 0 || !o && e.prevComposition != i && (e.prevTime < (n.time || 0) - r.newGroupDelay || !tg(n, e.prevRanges)), s = o ? rg(e.prevRanges, n.mapping) : ng(n.mapping.maps);
		return new Qh(e.done.addTransform(n, a ? t.selection.getBookmark() : void 0, r, cg(t)), Yh.empty, s, n.time, i ?? e.prevComposition);
	}
	return (a = n.getMeta("rebased")) ? new Qh(e.done.rebased(n, a), e.undone.rebased(n, a), rg(e.prevRanges, n.mapping), e.prevTime, e.prevComposition) : new Qh(e.done.addMaps(n.mapping.maps), e.undone.addMaps(n.mapping.maps), rg(e.prevRanges, n.mapping), e.prevTime, e.prevComposition);
}
function tg(e, t) {
	if (!t) return !1;
	if (!e.docChanged) return !0;
	let n = !1;
	return e.mapping.maps[0].forEach((e, r) => {
		for (let i = 0; i < t.length; i += 2) e <= t[i + 1] && r >= t[i] && (n = !0);
	}), n;
}
function ng(e) {
	let t = [];
	for (let n = e.length - 1; n >= 0 && t.length == 0; n--) e[n].forEach((e, n, r, i) => t.push(r, i));
	return t;
}
function rg(e, t) {
	if (!e) return null;
	let n = [];
	for (let r = 0; r < e.length; r += 2) {
		let i = t.map(e[r], 1), a = t.map(e[r + 1], -1);
		i <= a && n.push(i, a);
	}
	return n;
}
function ig(e, t) {
	for (let n = 0; n < t.steps.length; n++) {
		let r = t.mapping.maps[n], i = -1;
		if (r.forEach((e, t) => i = t), i < 0) {
			let e = t.steps[n];
			(e instanceof Xc || e instanceof Zc) && (i = e.to);
		}
		if (i > -1) return I.near(e.doc.resolve(i));
	}
	return e.selection;
}
function ag(e, t, n) {
	let r = cg(t), i = ug.get(t).spec.config, a = (n ? e.undone : e.done).popEvent(t, r);
	if (!a) return null;
	let o = a.selection.resolve(a.transform.doc), s = (n ? e.done : e.undone).addTransform(a.transform, ig(t, a.transform).getBookmark(), i, r), c = new Qh(n ? s : a.remaining, n ? a.remaining : s, null, 0, -1);
	return a.transform.setSelection(o).setMeta(ug, {
		redo: n,
		historyState: c
	});
}
var og = !1, sg = null;
function cg(e) {
	let t = e.plugins;
	if (sg != t) {
		og = !1, sg = t;
		for (let e = 0; e < t.length; e++) if (t[e].spec.historyPreserveItems) {
			og = !0;
			break;
		}
	}
	return og;
}
function lg(e) {
	return e.setMeta(dg, !0);
}
var ug = new B("history"), dg = new B("closeHistory");
function fg(e = {}) {
	return e = {
		depth: e.depth || 100,
		newGroupDelay: e.newGroupDelay || 500
	}, new z({
		key: ug,
		state: {
			init() {
				return new Qh(Yh.empty, Yh.empty, null, 0, -1);
			},
			apply(t, n, r) {
				return eg(n, r, t, e);
			}
		},
		config: e,
		props: { handleDOMEvents: { beforeinput(e, t) {
			let n = t.inputType, r = n == "historyUndo" ? mg : n == "historyRedo" ? hg : null;
			return !r || !e.editable ? !1 : (t.preventDefault(), r(e.state, e.dispatch));
		} } }
	});
}
function pg(e, t) {
	return (n, r) => {
		let i = ug.getState(n);
		if (!i || (e ? i.undone : i.done).eventCount == 0) return !1;
		if (r) {
			let a = ag(i, n, e);
			a && r(t ? a.scrollIntoView() : a);
		}
		return !0;
	};
}
var mg = pg(!1, !0), hg = pg(!0, !0);
function gg(e) {
	return e.getMeta(ug) != null;
}
// node_modules/@tiptap/core/dist/index.js
function _g(e) {
	let { state: t, transaction: n } = e, { selection: r } = n, { doc: i } = n, { storedMarks: a } = n;
	return {
		...t,
		apply: t.apply.bind(t),
		applyTransaction: t.applyTransaction.bind(t),
		plugins: t.plugins,
		schema: t.schema,
		reconfigure: t.reconfigure.bind(t),
		toJSON: t.toJSON.bind(t),
		get storedMarks() {
			return a;
		},
		get selection() {
			return r;
		},
		get doc() {
			return i;
		},
		get tr() {
			return r = n.selection, i = n.doc, a = n.storedMarks, n;
		}
	};
}
var vg = class e {
	constructor(e) {
		this.editor = e.editor, this.rawCommands = this.editor.extensionManager.commands, this.customState = e.state;
	}
	get hasCustomState() {
		return !!this.customState;
	}
	get state() {
		return this.customState || this.editor.state;
	}
	get commands() {
		let { rawCommands: e, editor: t, state: n } = this, { view: r } = t, { tr: i } = n, a = this.buildProps(i);
		return Object.fromEntries(Object.entries(e).map(([e, t]) => [e, (...e) => {
			let n = t(...e)(a);
			return !i.getMeta("preventDispatch") && !this.hasCustomState && r.dispatch(i), n;
		}]));
	}
	get chain() {
		return () => this.createChain();
	}
	get can() {
		return () => this.createCan();
	}
	createChain(e, t = !0) {
		let { rawCommands: n, editor: r, state: i } = this, { view: a } = r, o = [], s = !!e, c = e || i.tr, l = () => (!s && t && !c.getMeta("preventDispatch") && !this.hasCustomState && a.dispatch(c), o.every((e) => e === !0)), u = {
			...Object.fromEntries(Object.entries(n).map(([e, n]) => [e, (...e) => {
				let r = this.buildProps(c, t), i = n(...e)(r);
				return o.push(i), u;
			}])),
			run: l
		};
		return u;
	}
	static createFakeChain() {
		let e = new Proxy({}, { get: (t, n) => {
			if (n !== "then") return n === "run" ? () => !1 : () => e;
		} });
		return e;
	}
	createCan(e) {
		let { rawCommands: t, state: n } = this, r = e || n.tr, i = this.buildProps(r, !1);
		return {
			...Object.fromEntries(Object.entries(t).map(([e, t]) => [e, (...e) => t(...e)({
				...i,
				dispatch: void 0
			})])),
			chain: () => this.createChain(r, !1)
		};
	}
	static createFallbackCan() {
		let t = e.createFakeChain();
		return new Proxy({ chain: () => t }, { get: (e, t) => {
			if (t !== "then") return t === "chain" ? e.chain : () => !1;
		} });
	}
	buildProps(e, t = !0) {
		let { rawCommands: n, editor: r, state: i } = this, { view: a } = r, o = {
			tr: e,
			editor: r,
			view: a,
			state: _g({
				state: i,
				transaction: e
			}),
			dispatch: t ? () => void 0 : void 0,
			chain: () => this.createChain(e, t),
			can: () => this.createCan(e),
			get commands() {
				return Object.fromEntries(Object.entries(n).map(([e, t]) => [e, (...e) => t(...e)(o)]));
			}
		};
		return o;
	}
}, yg = () => ({ editor: e, view: t }) => (requestAnimationFrame(() => {
	if (!e.isDestroyed) {
		var n;
		t.dom.blur(), (n = window) == null || (n = n.getSelection()) == null || n.removeAllRanges();
	}
}), !0), bg = (e = !0) => ({ commands: t }) => t.setContent("", { emitUpdate: e }), xg = () => ({ tr: e, dispatch: t }) => {
	let { selection: n } = e, { ranges: r } = n;
	if (!t) return !0;
	let i = e.mapping.maps.length;
	return r.forEach(({ $from: t, $to: n }) => {
		let r = t.pos, a = n.pos, o = e.mapping.slice(i), s = 1;
		e.doc.nodesBetween(o.map(r), o.map(a), (t, n) => {
			s = Math.max(s, e.doc.resolve(n).depth + 1);
		});
		for (let t = 0; t < s; t += 1) {
			let t = e.doc, n = e.mapping.maps.length, o = e.mapping.slice(i), s = n, c = e.mapping.slice(n), l = o.map(r), u = o.map(a);
			if (t.nodesBetween(l, u, (t, r) => {
				if (t.type.isText) return;
				e.mapping.maps.length !== s && (s = e.mapping.maps.length, c = e.mapping.slice(n));
				let i = e.doc.resolve(c.map(r)), a = e.doc.resolve(c.map(r + t.nodeSize)), o = i.blockRange(a);
				if (!o) return;
				let l = ll(o);
				if (t.type.isTextblock) {
					let { defaultType: t } = i.parent.contentMatchAt(i.index()), n = e.doc.nodeAt(o.start);
					t && n && !n.hasMarkup(t) && t.validContent(n.content) && e.setNodeMarkup(o.start, t);
				}
				(l || l === 0) && e.lift(o, l);
			}), e.doc.eq(t)) break;
		}
	}), !0;
}, Sg = (e) => (t) => e(t), Cg = () => ({ state: e, dispatch: t }) => Lu(e, t), wg = (e, t) => ({ editor: n, tr: r }) => {
	let { state: i } = n, a = i.doc.slice(e.from, e.to);
	r.deleteRange(e.from, e.to);
	let o = r.mapping.map(t);
	return r.insert(o, a.content), r.setSelection(new L(r.doc.resolve(Math.max(o - 1, 0)))), !0;
}, Tg = () => ({ tr: e, dispatch: t }) => {
	let { selection: n } = e, r = n.$anchor.node();
	if (r.content.size > 0) return !1;
	let i = e.selection.$anchor;
	for (let n = i.depth; n > 0; --n) if (i.node(n).type === r.type) {
		if (t) {
			let t = i.before(n), r = i.after(n);
			e.delete(t, r).scrollIntoView();
		}
		return !0;
	}
	return !1;
};
function W(e, t) {
	if (typeof e == "string") {
		if (!t.nodes[e]) throw Error(`There is no node type named '${e}'. Maybe you forgot to add the extension?`);
		return t.nodes[e];
	}
	return e;
}
var Eg = (e) => ({ tr: t, state: n, dispatch: r }) => {
	let i = W(e, n.schema), a = t.selection.$anchor;
	for (let e = a.depth; e > 0; --e) if (a.node(e).type === i) {
		if (r) {
			let n = a.before(e), r = a.after(e);
			t.delete(n, r).scrollIntoView();
		}
		return !0;
	}
	return !1;
}, Dg = (e) => ({ tr: t, dispatch: n }) => {
	let { from: r, to: i } = e;
	return n && t.delete(r, i), !0;
}, Og = (e) => e.content ? /^text(\*|\+)/.test(e.content) : !1, kg = (e, t, n) => {
	if (!e.parent.isInline || n === "left" && e.pos > e.start() || n === "right" && e.pos < e.end()) return e.pos;
	let r = t.nodes[e.parent.type.name].spec;
	return Og(r) ? n === "left" ? e.start() - 1 : e.end() + 1 : e.pos;
}, Ag = (e, t, n) => ({
	from: kg(e, n, "left"),
	to: kg(t, n, "right")
}), jg = () => ({ state: e, dispatch: t }) => {
	if (e.selection.empty) return !1;
	if (t) {
		let n = e.tr, { ranges: r } = e.selection, i = e.selection instanceof L ? e.selection.$from.marksAcross(e.selection.$to) : null, a = n.steps.length;
		r.forEach((t) => {
			let r = n.mapping.slice(a), { from: i, to: o } = Ag(n.doc.resolve(r.map(t.$from.pos)), n.doc.resolve(r.map(t.$to.pos)), e.schema);
			n.deleteRange(i, o);
		}), n.selection.empty || n.setSelection(L.near(n.doc.resolve(n.selection.from))), i && n.ensureMarks(i), n.scrollIntoView(), t(n);
	}
	return !0;
}, Mg = () => ({ commands: e }) => e.keyboardShortcut("Enter"), Ng = () => ({ state: e, dispatch: t }) => Iu(e, t);
function Pg(e) {
	return Object.prototype.toString.call(e) === "[object RegExp]";
}
function Fg(e, t, n = { strict: !0 }) {
	let r = Object.keys(t);
	return !r.length || r.every((r) => n.strict ? t[r] === e[r] : Pg(t[r]) ? t[r].test(e[r]) : t[r] === e[r]);
}
function Ig(e, t, n = {}) {
	return e.find((e) => e.type === t && Fg(Object.fromEntries(Object.keys(n).map((t) => [t, e.attrs[t]])), n));
}
function Lg(e, t, n = {}) {
	return !!Ig(e, t, n);
}
function Rg(e, t, n) {
	if (!e || !t) return;
	let r = e.parent.childAfter(e.parentOffset);
	if (r.node && r.node.marks.some((e) => e.type === t) || (r = e.parent.childBefore(e.parentOffset)), !r.node || !r.node.marks.some((e) => e.type === t)) return;
	if (!n) {
		let e = r.node.marks.find((e) => e.type === t);
		e && (n = e.attrs);
	}
	if (!Ig([...r.node.marks], t, n)) return;
	let i = r.index, a = e.start() + r.offset, o = i + 1, s = a + r.node.nodeSize;
	for (; i > 0 && Lg([...e.parent.child(i - 1).marks], t, n);) --i, a -= e.parent.child(i).nodeSize;
	for (; o < e.parent.childCount && Lg([...e.parent.child(o).marks], t, n);) s += e.parent.child(o).nodeSize, o += 1;
	return {
		from: a,
		to: s
	};
}
function zg(e, t) {
	if (typeof e == "string") {
		if (!t.marks[e]) throw Error(`There is no mark type named '${e}'. Maybe you forgot to add the extension?`);
		return t.marks[e];
	}
	return e;
}
var Bg = (e, t) => ({ tr: n, state: r, dispatch: i }) => {
	let a = zg(e, r.schema), { doc: o, selection: s } = n, { $from: c, from: l, to: u } = s;
	if (i) {
		let e = Rg(c, a, t);
		if (e && e.from <= l && e.to >= u) {
			let t = L.create(o, e.from, e.to);
			n.setSelection(t);
		}
	}
	return !0;
}, Vg = (e) => (t) => {
	let n = typeof e == "function" ? e(t) : e;
	for (let e = 0; e < n.length; e += 1) if (n[e](t)) return !0;
	return !1;
};
function Hg(e) {
	return e instanceof L;
}
function Ug(e = 0, t = 0, n = 0) {
	return Math.min(Math.max(e, t), n);
}
function Wg(e, t = null) {
	if (!t) return null;
	let n = I.atStart(e), r = I.atEnd(e);
	if (t === "start" || t === !0) return n;
	if (t === "end") return r;
	let i = n.from, a = r.to;
	return t === "all" ? L.create(e, Ug(0, i, a), Ug(e.content.size, i, a)) : L.create(e, Ug(t, i, a), Ug(t, i, a));
}
function Gg() {
	return ["Android"].includes(navigator.platform) || /android/i.test(navigator.userAgent);
}
function Kg() {
	return [
		"iPad Simulator",
		"iPhone Simulator",
		"iPod Simulator",
		"iPad",
		"iPhone",
		"iPod"
	].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function qg() {
	return typeof navigator < "u" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
var Jg = (e = null, t = {}) => ({ editor: n, view: r, tr: i, dispatch: a }) => {
	t = {
		scrollIntoView: !0,
		...t
	};
	let o = () => {
		(Kg() || Gg()) && r.dom.focus(), qg() && !Kg() && !Gg() && r.dom.focus({ preventScroll: !0 }), requestAnimationFrame(() => {
			n.isDestroyed || (r.focus(), t?.scrollIntoView && n.commands.scrollIntoView());
		});
	};
	try {
		if (r.hasFocus() && e === null || e === !1) return !0;
	} catch {
		return !1;
	}
	if (a && e === null && !Hg(n.state.selection)) return o(), !0;
	let s = Wg(i.doc, e) || n.state.selection, c = n.state.selection.eq(s);
	return a && (c || i.setSelection(s), c && i.storedMarks && i.setStoredMarks(i.storedMarks), o()), !0;
}, Yg = (e, t) => (n) => e.every((e, r) => t(e, {
	...n,
	index: r
})), Xg = (e, t) => ({ tr: n, commands: r }) => r.insertContentAt({
	from: n.selection.from,
	to: n.selection.to
}, e, t), Zg = (e) => {
	let t = e.childNodes;
	for (let n = t.length - 1; n >= 0; --n) {
		let r = t[n];
		r.nodeType === 3 && r.nodeValue && /^(\n\s\s|\n)$/.test(r.nodeValue) ? e.removeChild(r) : r.nodeType === 1 && Zg(r);
	}
	return e;
};
function Qg(e) {
	if (typeof window > "u") throw Error("[tiptap error]: there is no window object available, so this function cannot be used");
	let t = `<body>${e}</body>`, n = new window.DOMParser().parseFromString(t, "text/html").body;
	return Zg(n);
}
function $g(e) {
	return typeof e?.nodesBetween == "function";
}
function e_(e, t, n) {
	if ($g(e)) return e;
	let r = typeof e == "object" && !!e;
	n = {
		slice: !0,
		parseOptions: {},
		...n
	};
	let i = typeof e == "string";
	if (r) try {
		if (Array.isArray(e) && e.length > 0) return M.fromArray(e.map((e) => t.nodeFromJSON(e)));
		let r = t.nodeFromJSON(e);
		return n.errorOnInvalidContent && r.check(), r;
	} catch (r) {
		if (n.errorOnInvalidContent) throw Error("[tiptap error]: Invalid JSON content", { cause: r });
		return console.warn("[tiptap warn]: Invalid content.", "Passed value:", e, "Error:", r), e_("", t, n);
	}
	if (i) {
		if (n.errorOnInvalidContent) {
			let r = !1, i = "", a = new uc({
				topNode: t.spec.topNode,
				marks: t.spec.marks,
				nodes: t.spec.nodes.append({ __tiptap__private__unknown__catch__all__node: {
					content: "inline*",
					group: "block",
					parseDOM: [{
						tag: "*",
						getAttrs: (e) => (r = !0, i = typeof e == "string" ? e : e.outerHTML, null)
					}]
				} })
			});
			if (n.slice ? mc.fromSchema(a).parseSlice(Qg(e), n.parseOptions) : mc.fromSchema(a).parse(Qg(e), n.parseOptions), n.errorOnInvalidContent && r) throw Error("[tiptap error]: Invalid HTML content", { cause: /* @__PURE__ */ Error(`Invalid element found: ${i}`) });
		}
		let r = mc.fromSchema(t);
		return n.slice ? r.parseSlice(Qg(e), n.parseOptions).content : r.parse(Qg(e), n.parseOptions);
	}
	return e_("", t, n);
}
function t_(e) {
	return !("type" in e);
}
function n_(e, t, n) {
	let r = e.steps.length - 1;
	if (r < t) return;
	let i = e.steps[r];
	if (!(i instanceof nl || i instanceof rl)) return;
	let a = e.mapping.maps[r], o = 0;
	a.forEach((e, t, n, r) => {
		o === 0 && (o = r);
	}), e.setSelection(I.near(e.doc.resolve(o), n));
}
var r_ = (e, t, n) => ({ tr: r, dispatch: i, editor: a }) => {
	if (i) {
		n = {
			parseOptions: a.options.parseOptions,
			updateSelection: !0,
			applyInputRules: !1,
			applyPasteRules: !1,
			...n
		};
		let i, o = (e) => {
			a.emit("contentError", {
				editor: a,
				error: e,
				disableCollaboration: () => {
					"collaboration" in a.storage && typeof a.storage.collaboration == "object" && a.storage.collaboration && (a.storage.collaboration.isDisabled = !0);
				}
			});
		}, s = {
			preserveWhitespace: "full",
			...n.parseOptions
		};
		if (!n.errorOnInvalidContent && !a.options.enableContentCheck && a.options.emitContentError) try {
			e_(t, a.schema, {
				parseOptions: s,
				errorOnInvalidContent: !0
			});
		} catch (e) {
			o(e);
		}
		try {
			i = e_(t, a.schema, {
				parseOptions: s,
				errorOnInvalidContent: n.errorOnInvalidContent ?? a.options.enableContentCheck
			});
		} catch (e) {
			return o(e), !1;
		}
		let { from: c, to: l } = typeof e == "number" ? {
			from: e,
			to: e
		} : {
			from: e.from,
			to: e.to
		}, u = !0, d = !0, f = t_(i) ? i.content : [i];
		if (f.forEach((e) => {
			e.check(), u = u ? e.isText && e.marks.length === 0 : !1, d = d ? e.isBlock : !1;
		}), c === l && d) {
			let { parent: e } = r.doc.resolve(c);
			e.isTextblock && !e.type.spec.code && !e.childCount && (--c, l += 1);
		}
		let p;
		if (u) p = Array.isArray(t) ? t.map((e) => e.text || "").join("") : $g(t) ? f.map((e) => e.text ?? "").join("") : typeof t == "object" && t && t.text ? t.text : t, r.insertText(p, c, l);
		else {
			p = M.from(f);
			let e = r.doc.resolve(c), t = e.node(), n = e.parentOffset === 0, i = t.isText || t.isTextblock, a = t.content.size > 0;
			n && i && a && d && (c = Math.max(0, c - 1)), r.replaceWith(c, l, f);
		}
		n.updateSelection && n_(r, r.steps.length - 1, -1), n.applyInputRules && r.setMeta("applyInputRules", {
			from: c,
			text: p
		}), n.applyPasteRules && r.setMeta("applyPasteRules", {
			from: c,
			text: p
		});
	}
	return !0;
};
function i_(e) {
	for (let t = 0; t < e.edgeCount; t += 1) {
		let { type: n } = e.edge(t);
		if (n.isTextblock && !n.hasRequiredAttrs()) return n;
	}
	return null;
}
var a_ = (e = {}) => ({ tr: t, dispatch: n, editor: r }) => {
	let { pos: i, attrs: a, content: o, updateSelection: s = !0 } = e, c;
	c = typeof i == "number" ? t.doc.resolve(i) : i || t.selection.$from;
	let l = i_(c.parent.contentMatchAt(c.index()));
	if (!l) return !1;
	let u = Object.keys(l.spec.attrs || {}), d = a ? Object.fromEntries(Object.entries(a).filter(([e]) => u.includes(e))) : {}, f;
	if (o) {
		let e = e_(o, r.schema);
		f = l.createAndFill(d, e);
	} else f = l.createAndFill(d);
	return f ? (n && (t.insert(c.pos, f), s && n_(t, t.steps.length - 1, -1)), !0) : !1;
}, o_ = () => ({ state: e, dispatch: t }) => ju(e, t), s_ = () => ({ state: e, dispatch: t }) => Mu(e, t), c_ = () => ({ state: e, dispatch: t }) => bu(e, t), l_ = () => ({ state: e, dispatch: t }) => Ou(e, t), u_ = (e, t) => {
	let n = e.resolve(t), r = n.nodeBefore, i = n.nodeAfter;
	return !r || !i ? !1 : !r.type.spec.isolating && !i.type.spec.isolating;
}, d_ = () => ({ state: e, dispatch: t, tr: n }) => {
	try {
		let r = El(e.doc, e.selection.$from.pos, -1);
		return r == null || !u_(e.doc, r) ? !1 : (n.join(r, 2), t && t(n), !0);
	} catch {
		return !1;
	}
}, f_ = () => ({ state: e, dispatch: t, tr: n }) => {
	try {
		let r = El(e.doc, e.selection.$from.pos, 1);
		return r == null || !u_(e.doc, r) ? !1 : (n.join(r, 2), t && t(n), !0);
	} catch {
		return !1;
	}
}, p_ = () => ({ state: e, dispatch: t }) => xu(e, t), m_ = () => ({ state: e, dispatch: t }) => Su(e, t);
function h_() {
	return typeof navigator < "u" && /Mac/.test(navigator.platform);
}
function g_(e) {
	let t = e.split(/-(?!$)/), n = t[t.length - 1];
	n === "Space" && (n = " ");
	let r, i, a, o;
	for (let e = 0; e < t.length - 1; e += 1) {
		let n = t[e];
		if (/^(cmd|meta|m)$/i.test(n)) o = !0;
		else if (/^a(lt)?$/i.test(n)) r = !0;
		else if (/^(c|ctrl|control)$/i.test(n)) i = !0;
		else if (/^s(hift)?$/i.test(n)) a = !0;
		else if (/^mod$/i.test(n)) Kg() || h_() ? o = !0 : i = !0;
		else throw Error(`Unrecognized modifier name: ${n}`);
	}
	return r && (n = `Alt-${n}`), i && (n = `Ctrl-${n}`), o && (n = `Meta-${n}`), a && (n = `Shift-${n}`), n;
}
var __ = (e) => ({ editor: t, view: n, tr: r, dispatch: i }) => {
	let a = g_(e).split(/-(?!$)/), o = a.find((e) => ![
		"Alt",
		"Ctrl",
		"Meta",
		"Shift"
	].includes(e)), s = new KeyboardEvent("keydown", {
		key: o === "Space" ? " " : o,
		altKey: a.includes("Alt"),
		ctrlKey: a.includes("Ctrl"),
		metaKey: a.includes("Meta"),
		shiftKey: a.includes("Shift"),
		bubbles: !0,
		cancelable: !0
	});
	return t.captureTransaction(() => {
		n.someProp("handleKeyDown", (e) => e(n, s));
	})?.steps.forEach((e) => {
		let t = e.map(r.mapping);
		t && i && r.maybeStep(t);
	}), !0;
};
function v_(e, t, n = {}) {
	let { from: r, to: i, empty: a } = e.selection, o = t ? W(t, e.schema) : null, s = [];
	e.doc.nodesBetween(r, i, (e, t) => {
		if (e.isText) return;
		let n = Math.max(r, t), a = Math.min(i, t + e.nodeSize);
		s.push({
			node: e,
			from: n,
			to: a
		});
	});
	let c = i - r, l = s.filter((e) => !o || o.name === e.node.type.name).filter((e) => Fg(e.node.attrs, n, { strict: !1 }));
	return a ? !!l.length : l.reduce((e, t) => e + t.to - t.from, 0) >= c;
}
var y_ = (e, t = {}) => ({ state: n, dispatch: r }) => v_(n, W(e, n.schema), t) ? Nu(n, r) : !1, b_ = () => ({ state: e, dispatch: t }) => Ru(e, t), x_ = (e) => ({ state: t, dispatch: n }) => ad(W(e, t.schema))(t, n), S_ = () => ({ state: e, dispatch: t }) => Pu(e, t);
function C_(e, t) {
	return t.nodes[e] ? "node" : t.marks[e] ? "mark" : null;
}
function w_(e, t) {
	let n = typeof t == "string" ? [t] : t;
	return Object.keys(e).reduce((t, r) => (n.includes(r) || (t[r] = e[r]), t), {});
}
var T_ = (e, t) => ({ tr: n, state: r, dispatch: i }) => {
	let a = null, o = null, s = C_(typeof e == "string" ? e : e.name, r.schema);
	if (!s) return !1;
	s === "node" && (a = W(e, r.schema)), s === "mark" && (o = zg(e, r.schema));
	let c = !1;
	return n.selection.ranges.forEach((e) => {
		r.doc.nodesBetween(e.$from.pos, e.$to.pos, (e, r) => {
			a && a === e.type && (c = !0, i && n.setNodeMarkup(r, void 0, w_(e.attrs, t))), o && e.marks.length && e.marks.forEach((a) => {
				o === a.type && (c = !0, i && n.addMark(r, r + e.nodeSize, o.create(w_(a.attrs, t))));
			});
		});
	}), c;
}, E_ = () => ({ tr: e, dispatch: t }) => (t && e.scrollIntoView(), !0), D_ = () => ({ tr: e, dispatch: t }) => {
	if (t) {
		let t = new nu(e.doc);
		e.setSelection(t);
	}
	return !0;
}, O_ = () => ({ state: e, dispatch: t }) => Tu(e, t), k_ = () => ({ state: e, dispatch: t }) => ku(e, t), A_ = () => ({ state: e, dispatch: t }) => Vu(e, t), j_ = () => ({ state: e, dispatch: t }) => qu(e, t), M_ = () => ({ state: e, dispatch: t }) => Ku(e, t);
function N_(e, t, n = {}, r = {}) {
	return e_(e, t, {
		slice: !1,
		parseOptions: n,
		errorOnInvalidContent: r.errorOnInvalidContent
	});
}
var P_ = (e, { errorOnInvalidContent: t, emitUpdate: n = !0, parseOptions: r = {} } = {}) => ({ editor: i, tr: a, dispatch: o, commands: s }) => {
	let { doc: c } = a;
	if (r.preserveWhitespace !== "full") {
		let s = N_(e, i.schema, r, { errorOnInvalidContent: t ?? i.options.enableContentCheck });
		if (o) {
			let e = t_(s) ? s.content : [s];
			a.replaceWith(0, c.content.size, e).setMeta("preventUpdate", !n);
		}
		return !0;
	}
	return o && a.setMeta("preventUpdate", !n), s.insertContentAt({
		from: 0,
		to: c.content.size
	}, e, {
		parseOptions: r,
		errorOnInvalidContent: t ?? i.options.enableContentCheck
	});
};
function F_(e, t) {
	let n = zg(t, e.schema), { from: r, to: i, empty: a } = e.selection, o = [];
	a ? (e.storedMarks && o.push(...e.storedMarks), o.push(...e.selection.$head.marks())) : e.doc.nodesBetween(r, i, (e) => {
		o.push(...e.marks);
	});
	let s = o.find((e) => e.type.name === n.name);
	return s ? { ...s.attrs } : {};
}
function I_(e, t) {
	let n = new Yl(e);
	return t.forEach((e) => {
		e.steps.forEach((e) => {
			n.step(e);
		});
	}), n;
}
function L_(e, t, n) {
	let r = [];
	return e.nodesBetween(t.from, t.to, (e, t) => {
		n(e) && r.push({
			node: e,
			pos: t
		});
	}), r;
}
function R_(e, t) {
	for (let n = e.depth; n > 0; --n) {
		let r = e.node(n);
		if (t(r)) return {
			pos: n > 0 ? e.before(n) : 0,
			start: e.start(n),
			depth: n,
			node: r
		};
	}
}
function z_(e) {
	return (t) => R_(t.$from, e);
}
function G(e, t, n) {
	return e.config[t] === void 0 && e.parent ? G(e.parent, t, n) : typeof e.config[t] == "function" ? e.config[t].bind({
		...n,
		parent: e.parent ? G(e.parent, t, n) : null
	}) : e.config[t];
}
function B_(e) {
	return e.map((e) => {
		let t = G(e, "addExtensions", {
			name: e.name,
			options: e.options,
			storage: e.storage
		});
		return t ? [e, ...B_(t())] : e;
	}).flat(10);
}
function V_(e, t) {
	let n = Oc.fromSchema(t).serializeFragment(e), r = document.implementation.createHTMLDocument().createElement("div");
	return r.appendChild(n), r.innerHTML;
}
function H_(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = n.get(t.type) ?? /* @__PURE__ */ new Map();
		e.set(t.name, t), n.set(t.type, e);
	}
	return [...Object.values(t.nodes), ...Object.values(t.marks)].flatMap((e) => Object.entries(e.spec.attrs ?? {}).map(([t, r]) => {
		let i = n.get(e.name)?.get(t), a = Object.hasOwn(r, "default");
		return {
			type: e.name,
			name: t,
			attribute: {
				rendered: !0,
				renderHTML: null,
				parseHTML: null,
				keepOnSplit: !0,
				...i?.attribute,
				default: r.default,
				isRequired: !a,
				validate: r.validate
			}
		};
	}));
}
var U_ = {
	content: "string",
	marks: "string",
	group: "string",
	inline: "boolean",
	atom: "boolean",
	selectable: "boolean",
	draggable: "boolean",
	code: "boolean",
	whitespace: ["pre", "normal"],
	definingAsContext: "boolean",
	definingForContent: "boolean",
	defining: "boolean",
	isolating: "boolean",
	linebreakReplacement: "boolean"
}, W_ = {
	inclusive: "boolean",
	excludes: "string",
	group: "string",
	spanning: "boolean",
	code: "boolean"
};
function G_(e, t, n) {
	return Object.fromEntries(Object.entries(t).flatMap(([t, r]) => {
		let i = e[t];
		if (i === void 0) return [];
		if (!(typeof r == "string" ? typeof i === r : typeof i == "string" && r.includes(i))) throw RangeError(`Invalid schemaSpec field '${n}.${t}'`);
		return [[t, i]];
	}));
}
function K_(e, t, n, r) {
	return {
		...Object.fromEntries(Object.entries(t).filter(([e]) => e !== "attrs" && !Object.hasOwn(r, e))),
		...G_(n, r, e),
		attrs: n.attrs
	};
}
function q_(e, t, n) {
	for (let r of Object.keys(t)) if (!Object.hasOwn(e, r)) throw RangeError(`schemaSpec requires a local ${n} extension named '${r}'`);
	for (let r of Object.keys(e)) if (!Object.hasOwn(t, r)) throw RangeError(`Local ${n} extension '${r}' is not in schemaSpec`);
}
function J_(e, t) {
	q_(e.nodes, t.nodes, "node"), q_(e.marks, t.marks, "mark");
	let n = t.spec.nodes, r = t.spec.marks;
	return t.spec.nodes.forEach((t, r) => {
		n = n.update(t, K_(t, e.nodes[t], r, U_));
	}), t.spec.marks.forEach((t, n) => {
		r = r.update(t, K_(t, e.marks[t], n, W_));
	}), {
		topNode: t.topNodeType.name,
		nodes: n,
		marks: r
	};
}
function Y_(e) {
	let t = e.filter((t, n) => e.indexOf(t) !== n);
	return Array.from(new Set(t));
}
function X_(e) {
	return {
		baseExtensions: e.filter((e) => e.type === "extension"),
		nodeExtensions: e.filter((e) => e.type === "node"),
		markExtensions: e.filter((e) => e.type === "mark")
	};
}
function Z_(e) {
	let t = [], { nodeExtensions: n, markExtensions: r } = X_(e), i = [...n, ...r], a = {
		default: null,
		validate: void 0,
		rendered: !0,
		renderHTML: null,
		parseHTML: null,
		keepOnSplit: !0,
		isRequired: !1
	}, o = n.filter((e) => e.name !== "text").map((e) => e.name), s = r.map((e) => e.name), c = [...o, ...s];
	return e.forEach((e) => {
		let n = G(e, "addGlobalAttributes", {
			name: e.name,
			options: e.options,
			storage: e.storage,
			extensions: i
		});
		n && n().forEach((e) => {
			let n;
			n = Array.isArray(e.types) ? e.types : e.types === "*" ? c : e.types === "nodes" ? o : e.types === "marks" ? s : [], n.forEach((n) => {
				Object.entries(e.attributes).forEach(([e, r]) => {
					t.push({
						type: n,
						name: e,
						attribute: {
							...a,
							...r
						}
					});
				});
			});
		});
	}), i.forEach((e) => {
		let n = G(e, "addAttributes", {
			name: e.name,
			options: e.options,
			storage: e.storage
		});
		if (!n) return;
		let r = n();
		Object.entries(r).forEach(([n, r]) => {
			let i = {
				...a,
				...r
			};
			typeof i?.default == "function" && (i.default = i.default()), i?.isRequired && i?.default === void 0 && delete i.default, t.push({
				type: e.name,
				name: n,
				attribute: i
			});
		});
	}), t;
}
function Q_(e) {
	return typeof e == "function";
}
function K(e, t = void 0, ...n) {
	return Q_(e) ? t ? e.bind(t)(...n) : e(...n) : e;
}
function $_(e = {}) {
	return Object.keys(e).length === 0 && e.constructor === Object;
}
function ev(e) {
	let t = [], n = "", r = !1, i = !1, a = 0, o = e.length;
	for (let s = 0; s < o; s += 1) {
		let o = e[s];
		if (o === "'" && !i) r = !r, n += o;
		else if (o === "\"" && !r) i = !i, n += o;
		else {
			if (!r && !i) {
				if (o === "(") {
					a += 1, n += o;
					continue;
				}
				if (o === ")" && a > 0) {
					--a, n += o;
					continue;
				}
				if (o === ";" && a === 0) {
					t.push(n), n = "";
					continue;
				}
			}
			n += o;
		}
	}
	return n && t.push(n), t;
}
function tv(e) {
	let t = [], n = ev(e || ""), r = n.length;
	for (let e = 0; e < r; e += 1) {
		let r = n[e], i = r.indexOf(":");
		if (i === -1) continue;
		let a = r.slice(0, i).trim(), o = r.slice(i + 1).trim();
		a && o && t.push([a, o]);
	}
	return t;
}
function q(...e) {
	return e.filter((e) => !!e).reduce((e, t) => {
		let n = { ...e };
		return Object.entries(t).forEach(([e, t]) => {
			if (e === "__proto__") Object.defineProperty(n, e, {
				configurable: !0,
				enumerable: !0,
				value: t,
				writable: !0
			});
			else if (!n[e]) n[e] = t;
			else if (e === "class") {
				let r = t ? String(t).split(" ") : [], i = n[e] ? n[e].split(" ") : [], a = r.filter((e) => !i.includes(e));
				n[e] = [...i, ...a].join(" ");
			} else if (e === "style") {
				let r = new Map([...tv(n[e]), ...tv(t)]);
				n[e] = Array.from(r.entries()).map(([e, t]) => `${e}: ${t}`).join("; ");
			} else n[e] = t;
		}), n;
	}, {});
}
function nv(e, t) {
	return t.filter((t) => t.type === e.type.name).filter((e) => e.attribute.rendered).map((t) => t.attribute.renderHTML ? t.attribute.renderHTML(e.attrs) || {} : { [t.name]: e.attrs[t.name] }).reduce((e, t) => q(e, t), {});
}
function rv(e) {
	return typeof e == "string" ? e.match(/^[+-]?(?:\d*\.)?\d+$/) ? Number(e) : e === "true" || e !== "false" && e : e;
}
function iv(e, t) {
	return "style" in e ? e : {
		...e,
		getAttrs: (n) => {
			let r = e.getAttrs ? e.getAttrs(n) : e.attrs;
			if (r === !1) return !1;
			let i = t.reduce((e, t) => {
				let r = t.attribute.parseHTML ? t.attribute.parseHTML(n) : rv(n.getAttribute(t.name));
				return r == null ? e : {
					...e,
					[t.name]: r
				};
			}, {});
			return {
				...r,
				...i
			};
		}
	};
}
function av(e) {
	return Object.fromEntries(Object.entries(e).filter(([e, t]) => e === "attrs" && $_(t) ? !1 : t != null));
}
function ov(e) {
	var t, n;
	let r = {};
	return !(e != null && (t = e.attribute) != null && t.isRequired) && "default" in (e?.attribute || {}) && (r.default = e.attribute.default), (e == null || (n = e.attribute) == null ? void 0 : n.validate) !== void 0 && (r.validate = e.attribute.validate), [e.name, r];
}
function sv(e, t, n = Z_(e)) {
	let { nodeExtensions: r, markExtensions: i } = X_(e);
	return {
		topNode: r.find((e) => G(e, "topNode"))?.name,
		nodes: Object.fromEntries(r.map((r) => {
			let i = n.filter((e) => e.type === r.name), a = {
				name: r.name,
				options: r.options,
				storage: r.storage,
				editor: t
			}, o = av({
				...e.reduce((e, t) => {
					let n = G(t, "extendNodeSchema", a);
					return {
						...e,
						...n ? n(r) : {}
					};
				}, {}),
				content: K(G(r, "content", a)),
				marks: K(G(r, "marks", a)),
				group: K(G(r, "group", a)),
				inline: K(G(r, "inline", a)),
				atom: K(G(r, "atom", a)),
				selectable: K(G(r, "selectable", a)),
				draggable: K(G(r, "draggable", a)),
				code: K(G(r, "code", a)),
				whitespace: K(G(r, "whitespace", a)),
				linebreakReplacement: K(G(r, "linebreakReplacement", a)),
				defining: K(G(r, "defining", a)),
				isolating: K(G(r, "isolating", a)),
				attrs: Object.fromEntries(i.map(ov))
			}), s = K(G(r, "parseHTML", a));
			s && (o.parseDOM = s.map((e) => iv(e, i)));
			let c = G(r, "renderHTML", a);
			c && (o.toDOM = (e) => c({
				node: e,
				HTMLAttributes: nv(e, i)
			}));
			let l = G(r, "renderText", a);
			return l && (o.toText = l), [r.name, o];
		})),
		marks: Object.fromEntries(i.map((r) => {
			let i = n.filter((e) => e.type === r.name), a = {
				name: r.name,
				options: r.options,
				storage: r.storage,
				editor: t
			}, o = av({
				...e.reduce((e, t) => {
					let n = G(t, "extendMarkSchema", a);
					return {
						...e,
						...n ? n(r) : {}
					};
				}, {}),
				inclusive: K(G(r, "inclusive", a)),
				excludes: K(G(r, "excludes", a)),
				group: K(G(r, "group", a)),
				spanning: K(G(r, "spanning", a)),
				code: K(G(r, "code", a)),
				attrs: Object.fromEntries(i.map(ov))
			}), s = K(G(r, "parseHTML", a));
			s && (o.parseDOM = s.map((e) => iv(e, i)));
			let c = G(r, "renderHTML", a);
			return c && (o.toDOM = (e) => c({
				mark: e,
				HTMLAttributes: nv(e, i)
			})), [r.name, o];
		}))
	};
}
function cv(e, t, n) {
	if (n === void 0) return new uc(sv(e, t));
	let r = Y_(e.filter((e) => e.type !== "extension").map((e) => e.name));
	if (r.length) throw RangeError(`Duplicate local schema types: ${r.join(", ")}`);
	let i = new uc(n);
	return new uc(J_(sv(e, t, H_(Z_(e), i)), i));
}
function lv(e) {
	return e.sort((e, t) => {
		let n = G(e, "priority") || 100, r = G(t, "priority") || 100;
		return n > r ? -1 : +(n < r);
	});
}
function uv(e) {
	let t = lv(B_(e)), n = Y_(t.map((e) => e.name));
	return n.length && console.warn(`[tiptap warn]: Duplicate extension names found: [${n.map((e) => `'${e}'`).join(", ")}]. This can lead to issues.`), t;
}
function dv(e, t, n) {
	let { from: r, to: i } = t, { blockSeparator: a = "\n\n", textSerializers: o = {} } = n || {}, s = "";
	return e.nodesBetween(r, i, (e, n, c, l) => {
		e.isBlock && n > r && (s += a);
		let u = o?.[e.type.name];
		if (u) return c && (s += u({
			node: e,
			pos: n,
			parent: c,
			index: l,
			range: t
		})), !1;
		if (e.isText) {
			var d;
			s += e == null || (d = e.text) == null ? void 0 : d.slice(Math.max(r, n) - n, i - n);
		}
	}), s;
}
function fv(e, t) {
	return dv(e, {
		from: 0,
		to: e.content.size
	}, t);
}
function pv(e) {
	return Object.fromEntries(Object.entries(e.nodes).filter(([, e]) => e.spec.toText).map(([e, t]) => [e, t.spec.toText]));
}
function mv(e, t) {
	let n = W(t, e.schema), { from: r, to: i } = e.selection, a = [];
	e.doc.nodesBetween(r, i, (e) => {
		a.push(e);
	});
	let o = a.reverse().find((e) => e.type.name === n.name);
	return o ? { ...o.attrs } : {};
}
function hv(e, t) {
	let n = C_(typeof t == "string" ? t : t.name, e.schema);
	return n === "node" ? mv(e, t) : n === "mark" ? F_(e, t) : {};
}
function gv(e, t = JSON.stringify) {
	let n = {};
	return e.filter((e) => {
		let r = t(e);
		return Object.prototype.hasOwnProperty.call(n, r) ? !1 : n[r] = !0;
	});
}
function _v(e) {
	let t = gv(e);
	return t.length === 1 ? t : t.filter((e, n) => !t.filter((e, t) => t !== n).some((t) => e.oldRange.from >= t.oldRange.from && e.oldRange.to <= t.oldRange.to && e.newRange.from >= t.newRange.from && e.newRange.to <= t.newRange.to));
}
function vv(e) {
	let { mapping: t, steps: n } = e, r = [], i = t.invert();
	return t.maps.forEach((e, a) => {
		let o = [];
		if (e.ranges.length) e.forEach((e, t) => {
			o.push({
				from: e,
				to: t
			});
		});
		else {
			let { from: e, to: t } = n[a];
			if (e === void 0 || t === void 0) return;
			o.push({
				from: e,
				to: t
			});
		}
		let s = t.slice(a);
		o.forEach(({ from: e, to: t }) => {
			let n = s.map(e, -1), a = s.map(t), o = i.map(n, -1), c = i.map(a);
			r.push({
				oldRange: {
					from: o,
					to: c
				},
				newRange: {
					from: n,
					to: a
				}
			});
		});
	}), _v(r);
}
function yv(e, t, n) {
	let r = [];
	return e === t ? n.resolve(e).marks().forEach((t) => {
		let i = Rg(n.resolve(e), t.type);
		i && r.push({
			mark: t,
			...i
		});
	}) : n.nodesBetween(e, t, (e, t) => {
		e && e?.nodeSize !== void 0 && r.push(...e.marks.map((n) => ({
			from: t,
			to: t + e.nodeSize,
			mark: n
		})));
	}), r;
}
var bv = (e, t, n, r = 20) => {
	let i = e.doc.resolve(n), a = r, o = null;
	for (; a > 0 && o === null;) {
		let e = i.node(a);
		e?.type.name === t ? o = e : --a;
	}
	return [o, a];
}, xv = (e) => {
	let t = e.depth - 1;
	if (t < 0) return null;
	let n = e.index(t);
	return n === 0 ? null : e.node(t).child(n - 1);
};
function Sv(e, t) {
	return t.nodes[e] || t.marks[e] || null;
}
function Cv(e, t, n) {
	return Object.fromEntries(Object.entries(n).filter(([n]) => {
		let r = e.find((e) => e.type === t && e.name === n);
		return r ? r.attribute.keepOnSplit : !1;
	}));
}
var wv = (e, t = 500) => {
	let n = "", r = e.parentOffset;
	return e.parent.nodesBetween(Math.max(0, r - t), r, (e, t, i, a) => {
		var o;
		let s = (o = e.type.spec).toText?.call(o, {
			node: e,
			pos: t,
			parent: i,
			index: a
		}) || e.textContent || "%leaf%";
		n += e.isAtom && !e.isText ? s : s.slice(0, Math.max(0, r - t));
	}), n;
};
function Tv(e, t, n = {}) {
	let { empty: r, ranges: i } = e.selection, a = t ? zg(t, e.schema) : null;
	if (r) return !!(e.storedMarks || e.selection.$from.marks()).filter((e) => !a || a.name === e.type.name).find((e) => Fg(e.attrs, n, { strict: !1 }));
	let o = 0, s = [];
	if (i.forEach(({ $from: t, $to: n }) => {
		let r = t.pos, i = n.pos;
		e.doc.nodesBetween(r, i, (e, t) => {
			if (a && e.inlineContent && !e.type.allowsMarkType(a)) return !1;
			if (!e.isText && !e.marks.length) return;
			let n = Math.max(r, t), c = Math.min(i, t + e.nodeSize), l = c - n;
			o += l, s.push(...e.marks.map((e) => ({
				mark: e,
				from: n,
				to: c
			})));
		});
	}), o === 0) return !1;
	let c = s.filter((e) => !a || a.name === e.mark.type.name).filter((e) => Fg(e.mark.attrs, n, { strict: !1 })).reduce((e, t) => e + t.to - t.from, 0), l = s.filter((e) => !a || e.mark.type !== a && e.mark.type.excludes(a)).reduce((e, t) => e + t.to - t.from, 0);
	return (c > 0 ? c + l : c) >= o;
}
function Ev(e, t, n = {}) {
	if (!t) return v_(e, null, n) || Tv(e, null, n);
	let r = C_(t, e.schema);
	return r === "node" ? v_(e, t, n) : r === "mark" && Tv(e, t, n);
}
var Dv = (e, t) => {
	let { $from: n, $to: r, $anchor: i } = e.selection;
	if (t) {
		let n = z_((e) => e.type.name === t)(e.selection);
		if (!n) return !1;
		let r = e.doc.resolve(n.pos + 1);
		return i.pos + 1 === r.end();
	}
	return !(r.parentOffset < r.parent.nodeSize - 2 || n.pos !== r.pos);
}, Ov = (e) => {
	let { $from: t, $to: n } = e.selection;
	return !(t.parentOffset > 0 || t.pos !== n.pos);
};
function kv(e, t) {
	return Array.isArray(t) ? t.some((t) => (typeof t == "string" ? t : t.name) === e.name) : t;
}
function Av(e, t) {
	let { nodeExtensions: n } = X_(t), r = n.find((t) => t.name === e);
	if (!r) return !1;
	let i = K(G(r, "group", {
		name: r.name,
		options: r.options,
		storage: r.storage
	}));
	return typeof i == "string" && i.split(" ").includes("list");
}
function jv(e, { checkChildren: t = !0, ignoreWhitespace: n = !1 } = {}) {
	if (n) {
		if (e.type.name === "hardBreak") return !0;
		if (e.isText) return !/\S/.test(e.text ?? "");
	}
	if (e.isText) return !e.text;
	if (e.isAtom || e.isLeaf) return !1;
	if (e.content.childCount === 0) return !0;
	if (t) {
		let r = !0;
		return e.content.forEach((e) => {
			r !== !1 && (jv(e, {
				ignoreWhitespace: n,
				checkChildren: t
			}) || (r = !1));
		}), r;
	}
	return !1;
}
function Mv(e) {
	return e instanceof R;
}
function Nv(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e;
	return typeof t.apply == "function" && typeof t.getMap == "function" && typeof t.invert == "function" && typeof t.map == "function" && typeof t.merge == "function" && typeof t.toJSON == "function";
}
function Pv(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e;
	if (!Nv(t)) return !1;
	let n = t.toJSON();
	return !(typeof n != "object" || !n || n.stepType !== "replace");
}
var Fv = class e {
	constructor(e) {
		this.position = e;
	}
	static fromJSON(t) {
		return new e(t.position);
	}
	toJSON() {
		return { position: this.position };
	}
};
function Iv(e, t) {
	let n = t.mapping.mapResult(e.position);
	return {
		position: new Fv(n.pos),
		mapResult: n
	};
}
function Lv(e) {
	return new Fv(e);
}
function Rv(e, t, n) {
	let { selection: r } = t, i = null;
	if (Hg(r) && (i = r.$cursor), i) {
		let t = e.storedMarks ?? i.marks();
		return i.parent.type.allowsMarkType(n) && (!!n.isInSet(t) || !t.some((e) => e.type.excludes(n)));
	}
	let { ranges: a } = r;
	return a.some(({ $from: t, $to: r }) => {
		let i = t.depth === 0 && e.doc.inlineContent && e.doc.type.allowsMarkType(n);
		return e.doc.nodesBetween(t.pos, r.pos, (e, t, r) => {
			if (i) return !1;
			if (e.isInline) {
				let t = !r || r.type.allowsMarkType(n), a = !!n.isInSet(e.marks) || !e.marks.some((e) => e.type.excludes(n));
				i = t && a;
			}
			return !i;
		}), i;
	});
}
var zv = (e, t = {}) => ({ tr: n, state: r, dispatch: i }) => {
	let { selection: a } = n, { empty: o, ranges: s } = a, c = zg(e, r.schema);
	if (i) {
		if (o) {
			let e = F_(r, c);
			n.addStoredMark(c.create({
				...e,
				...t
			}));
		} else s.forEach((e) => {
			let i = e.$from.pos, a = e.$to.pos;
			r.doc.nodesBetween(i, a, (e, r) => {
				let o = Math.max(r, i), s = Math.min(r + e.nodeSize, a);
				e.marks.find((e) => e.type === c) ? e.marks.forEach((e) => {
					c === e.type && n.addMark(o, s, c.create({
						...e.attrs,
						...t
					}));
				}) : n.addMark(o, s, c.create(t));
			});
		});
	}
	return Rv(r, n, c);
}, Bv = (e, t) => ({ tr: n }) => (n.setMeta(e, t), !0), Vv = (e, t = {}) => ({ state: n, dispatch: r, chain: i }) => {
	let a = W(e, n.schema), o;
	return n.selection.$anchor.sameParent(n.selection.$head) && (o = n.selection.$anchor.parent.attrs), a.isTextblock ? i().command(({ commands: e }) => Yu(a, {
		...o,
		...t
	})(n) ? !0 : e.clearNodes()).command(({ state: e }) => Yu(a, {
		...o,
		...t
	})(e, r)).run() : (console.warn("[tiptap warn]: Currently \"setNode()\" only supports text block nodes."), !1);
}, Hv = (e) => ({ tr: t, dispatch: n }) => {
	if (n) {
		let { doc: n } = t, r = Ug(e, 0, n.content.size), i = R.create(n, r);
		t.setSelection(i);
	}
	return !0;
}, Uv = (e, t) => ({ tr: n, state: r, dispatch: i }) => {
	let { selection: a } = r, o, s;
	return typeof t == "number" ? (o = t, s = t) : t && "from" in t && "to" in t ? (o = t.from, s = t.to) : (o = a.from, s = a.to), i && n.doc.nodesBetween(o, s, (t, r) => {
		t.isText || n.setNodeMarkup(r, void 0, {
			...t.attrs,
			dir: e
		});
	}), !0;
}, Wv = (e) => ({ tr: t, dispatch: n }) => {
	if (n) {
		let { doc: n } = t, { from: r, to: i } = typeof e == "number" ? {
			from: e,
			to: e
		} : e, a = L.atStart(n).from, o = L.atEnd(n).to, s = Ug(r, a, o), c = Ug(i, a, o), l = L.create(n, s, c);
		t.setSelection(l);
	}
	return !0;
}, Gv = (e) => ({ state: t, dispatch: n }) => cd(W(e, t.schema))(t, n);
function Kv(e, t) {
	let n = e.storedMarks || e.selection.$to.parentOffset && e.selection.$from.marks();
	if (n) {
		let r = n.filter((e) => t?.includes(e.type.name));
		e.tr.ensureMarks(r);
	}
}
var qv = ({ keepMarks: e = !0 } = {}) => ({ tr: t, state: n, dispatch: r, editor: i }) => {
	let { selection: a, doc: o } = t, { $from: s, $to: c } = a, l = i.extensionManager.attributes, u = Cv(l, s.node().type.name, s.node().attrs);
	if (a instanceof R && a.node.isBlock) return !s.parentOffset || !xl(o, s.pos) ? !1 : (r && (e && Kv(n, i.extensionManager.splittableMarks), t.split(s.pos).scrollIntoView()), !0);
	if (!s.parent.isBlock) return !1;
	let d = c.parentOffset === c.parent.content.size, f = s.depth === 0 ? void 0 : i_(s.node(-1).contentMatchAt(s.indexAfter(-1))), p = d && f ? [{
		type: f,
		attrs: u
	}] : void 0, m = a instanceof L && !a.empty ? mu.create({
		doc: t.doc,
		selection: a
	}).tr.deleteSelection() : null, h = m ? m.doc : t.doc, g = m ? m.mapping.map(s.pos) : s.pos, _ = xl(h, g, 1, p);
	if (!p && !_ && xl(h, g, 1, f ? [{ type: f }] : void 0) && (_ = !0, p = f ? [{
		type: f,
		attrs: u
	}] : void 0), r) {
		if (_) {
			let e = t.steps.length;
			if (a instanceof L && t.deleteSelection(), t.split(t.mapping.slice(e).map(s.pos), 1, p), f && !d && !s.parentOffset && s.parent.type !== f) {
				let n = t.mapping.slice(e).map(s.before()), r = t.doc.resolve(n);
				s.node(-1).canReplaceWith(r.index(), r.index() + 1, f) && t.setNodeMarkup(t.mapping.slice(e).map(s.before()), f);
			}
		}
		e && Kv(n, i.extensionManager.splittableMarks), t.scrollIntoView();
	}
	return _;
}, Jv = (e, t = {}) => ({ tr: n, state: r, dispatch: i, editor: a }) => {
	let o = W(e, r.schema), { $from: s, $to: c } = r.selection, l = r.selection.node;
	if (l && l.isBlock || s.depth < 2 || !s.sameParent(c)) return !1;
	let u = s.node(-1);
	if (u.type !== o) return !1;
	let d = a.extensionManager.attributes;
	if (s.parent.content.size === 0 && s.node(-1).childCount === s.indexAfter(-1)) {
		if (s.depth === 2 || s.node(-3).type !== o || s.index(-2) !== s.node(-2).childCount - 1) return !1;
		if (i) {
			let e = M.empty, r = s.index(-1) ? 1 : s.index(-2) ? 2 : 3;
			for (let t = s.depth - r; t >= s.depth - 3; --t) e = M.from(s.node(t).copy(e));
			let i = s.indexAfter(-1) < s.node(-2).childCount ? 1 : s.indexAfter(-2) < s.node(-3).childCount ? 2 : 3, a = {
				...Cv(d, s.node().type.name, s.node().attrs),
				...t
			}, c = o.contentMatch.defaultType?.createAndFill(a) || void 0;
			e = e.append(M.from(o.createAndFill(null, c) || void 0));
			let l = s.before(s.depth - (r - 1));
			n.replace(l, s.after(-i), new P(e, 4 - r, 0));
			let u = -1;
			n.doc.nodesBetween(l, n.doc.content.size, (e, t) => {
				if (u > -1) return !1;
				e.isTextblock && e.content.size === 0 && (u = t + 1);
			}), u > -1 && n.setSelection(L.near(n.doc.resolve(u))), n.scrollIntoView();
		}
		return !0;
	}
	let f = c.pos === s.end() ? u.contentMatchAt(0).defaultType : null, p = {
		...Cv(d, u.type.name, u.attrs),
		...t
	}, m = {
		...Cv(d, s.node().type.name, s.node().attrs),
		...t
	}, h = s.parentOffset === 0 && s.index(-1) === 0, g = s.before(-1);
	n.delete(s.pos, c.pos);
	let _ = h ? u.attrs : p, ee = f ? [{
		type: o,
		attrs: _
	}, {
		type: f,
		attrs: m
	}] : [{
		type: o,
		attrs: _
	}];
	if (!xl(n.doc, s.pos, 2)) return !1;
	if (i) {
		let { selection: e, storedMarks: t } = r, { splittableMarks: o } = a.extensionManager, c = t || e.$to.parentOffset && e.$from.marks();
		if (n.split(s.pos, 2, ee).scrollIntoView(), h && n.setNodeMarkup(g, void 0, p), !c || !i) return !0;
		let l = c.filter((e) => o.includes(e.type.name));
		n.ensureMarks(l);
	}
	return !0;
};
function Yv(e, t, n) {
	if (!e.validContent(t)) return null;
	try {
		return e.create(n, t);
	} catch {
		return null;
	}
}
function Xv(e, t) {
	if (e.pendingContent.length === 0) return !0;
	let n = Yv(t, M.from(e.pendingContent));
	return n ? (e.items.push(n), e.pendingContent = [], !0) : !1;
}
function Zv(e, t, n) {
	return n.validContent(M.from([...t.pendingContent, e])) ? (t.pendingContent.push(e), !0) : !Xv(t, n) || !n.validContent(M.from(e)) ? !1 : (t.pendingContent.push(e), !0);
}
function Qv(e, t, n, r) {
	let i = r(e, n);
	if (!i) return !1;
	let a = Yv(n.listType, M.from(i), e.attrs);
	return a ? n.itemType.validContent(M.from([...t.pendingContent, a])) ? (t.pendingContent.push(a), !0) : Xv(t, n.itemType) ? (t.items.push(...i), !0) : !1 : !1;
}
function $v(e, t, n) {
	let r = {
		items: [],
		pendingContent: []
	};
	for (let i = 0; i < e.childCount; i += 1) {
		let a = e.child(i);
		if (!(t.isListNode(a) ? Qv(a, r, t, n) : Zv(a, r, t.itemType))) return null;
	}
	return Xv(r, t.itemType) ? r.items : null;
}
function ey(e, t) {
	let n = [];
	for (let r = 0; r < e.childCount; r += 1) {
		let i = $v(e.child(r), t, ey);
		if (!i) return null;
		n.push(...i);
	}
	return n;
}
function ty(e, t) {
	let n = null;
	return e.descendants((e, r) => e !== t || (n = r, !1)), n;
}
function ny(e) {
	return !e || e === "1" ? null : e;
}
function ry(e, t) {
	return ny(e) === ny(t);
}
var iy = (e, t) => {
	let n = z_((e) => e.type === t)(e.selection);
	if (!n) return !0;
	let r = e.doc.resolve(Math.max(0, n.pos - 1)).before(n.depth);
	if (r === void 0) return !0;
	let i = e.doc.nodeAt(r);
	return !(n.node.type === i?.type && Cl(e.doc, n.pos)) || !ry(n.node.attrs.type, i?.attrs.type) || e.join(n.pos), !0;
}, ay = (e, t) => {
	let n = z_((e) => e.type === t)(e.selection);
	if (!n) return !0;
	let r = e.doc.resolve(n.start).after(n.depth);
	if (r === void 0) return !0;
	let i = e.doc.nodeAt(r);
	return !(n.node.type === i?.type && Cl(e.doc, r)) || !ry(n.node.attrs.type, i?.attrs.type) || e.join(r), !0;
};
function oy(e) {
	let t = e.doc, n = t.firstChild;
	if (!n) return null;
	let r = t.resolve(1), i = t.resolve(n.nodeSize - 1);
	return L.between(r, i);
}
var sy = (e, t, n, r = {}) => ({ editor: i, tr: a, state: o, dispatch: s, chain: c, commands: l, can: u }) => {
	let { extensions: d, splittableMarks: f } = i.extensionManager, p = W(e, o.schema), m = W(t, o.schema), { selection: h, storedMarks: g } = o, { $from: _, $to: ee } = h, te = _.blockRange(ee), v = g || h.$to.parentOffset && h.$from.marks();
	if (!te) return !1;
	let y = z_((e) => Av(e.type.name, d))(h), ne = h.from === 0 && h.to === o.doc.content.size, re = o.doc.content.content, ie = re.length === 1 ? re[0] : null, ae = ne && ie && Av(ie.type.name, d) ? {
		node: ie,
		pos: 0,
		depth: 0
	} : null, oe = y ?? ae, se = !!y && te.depth >= 1 && te.depth - y.depth <= 1, ce = !!ae;
	if ((se || ce) && oe) {
		if (oe.node.type === p) return ne && ce ? c().command(({ tr: e, dispatch: t }) => {
			let n = oy(e);
			return n ? (e.setSelection(n), t && t(e), !0) : !1;
		}).liftListItem(m).run() : l.liftListItem(m);
		if (Av(oe.node.type.name, d) && p.validContent(oe.node.content)) return c().command(() => (a.setNodeMarkup(oe.pos, p), !0)).command(() => iy(a, p)).command(() => ay(a, p)).run();
		if (Av(oe.node.type.name, d)) {
			let e = oe.node.firstChild?.type;
			if (e && e !== m) {
				let e = ey(oe.node, {
					listType: p,
					itemType: m,
					isListNode: (e) => Av(e.type.name, d)
				}), t = e ? M.from(e) : null;
				return !t || !p.validContent(t) ? !1 : c().command(() => {
					let { $anchor: e, $head: n } = a.selection, i = e.parent, o = n.parent, s = e.parentOffset, c = n.parentOffset, l;
					try {
						l = p.create(r, t);
					} catch {
						return !1;
					}
					if (a.replaceWith(oe.pos, oe.pos + oe.node.nodeSize, l), i.inlineContent && o.inlineContent) {
						let e = ty(l, i), t = ty(l, o);
						if (e !== null && t !== null) {
							let n = oe.pos + e + 2 + s, r = oe.pos + t + 2 + c;
							a.setSelection(L.create(a.doc, n, r));
						}
					}
					return !0;
				}).command(() => iy(a, p)).command(() => ay(a, p)).run();
			}
		}
	}
	return !n || !v || !s ? c().command(() => u().wrapInList(p, r) ? !0 : l.clearNodes()).wrapInList(p, r).command(() => iy(a, p)).command(() => ay(a, p)).run() : c().command(() => {
		let e = u().wrapInList(p, r), t = v.filter((e) => f.includes(e.type.name));
		return a.ensureMarks(t), e ? !0 : l.clearNodes();
	}).wrapInList(p, r).command(() => iy(a, p)).command(() => ay(a, p)).run();
}, cy = (e, t = {}, n = {}) => ({ state: r, commands: i }) => {
	let { extendEmptyMarkRange: a = !1 } = n, o = zg(e, r.schema);
	return Tv(r, o, t) ? i.unsetMark(o, { extendEmptyMarkRange: a }) : i.setMark(o, t);
}, ly = (e, t, n = {}) => ({ state: r, commands: i }) => {
	let a = W(e, r.schema), o = W(t, r.schema), s = v_(r, a, n), c;
	return r.selection.$anchor.sameParent(r.selection.$head) && (c = r.selection.$anchor.parent.attrs), s ? i.setNode(o, c) : i.setNode(a, {
		...c,
		...n
	});
}, uy = (e, t = {}) => ({ state: n, commands: r }) => {
	let i = W(e, n.schema);
	return v_(n, i, t) ? r.lift(i) : r.wrapIn(i, t);
}, dy = () => ({ state: e, dispatch: t }) => {
	let n = e.plugins;
	for (let r = 0; r < n.length; r += 1) {
		let i = n[r], a;
		if (i.spec.isInputRules && (a = i.getState(e))) {
			if (t) {
				let t = e.tr, n = a.transform;
				for (let e = n.steps.length - 1; e >= 0; --e) t.step(n.steps[e].invert(n.docs[e]));
				if (a.text) {
					let n = t.doc.resolve(a.from).marks();
					t.replaceWith(a.from, a.to, e.schema.text(a.text, n));
				} else t.delete(a.from, a.to);
			}
			return !0;
		}
	}
	return !1;
}, fy = (e = {}) => ({ tr: t, dispatch: n, editor: r }) => {
	let { ignoreClearable: i = !1 } = e, { selection: a } = t, { empty: o, ranges: s } = a;
	if (o) return !0;
	let { nonClearableMarks: c } = r.extensionManager;
	if (n) {
		let e = Object.values(r.schema.marks).filter((e) => i || !c.includes(e.name));
		s.forEach((n) => {
			for (let r of e) t.removeMark(n.$from.pos, n.$to.pos, r);
		});
	}
	return !0;
}, py = (e, t = {}) => ({ tr: n, state: r, dispatch: i }) => {
	let { extendEmptyMarkRange: a = !1 } = t, { selection: o } = n, s = zg(e, r.schema), { $from: c, empty: l, ranges: u } = o;
	if (!i) return !0;
	if (l && a) {
		let { from: e, to: t } = o, r = Rg(c, s, c.marks().find((e) => e.type === s)?.attrs);
		r && (e = r.from, t = r.to), n.removeMark(e, t, s);
	} else u.forEach((e) => {
		n.removeMark(e.$from.pos, e.$to.pos, s);
	});
	return n.removeStoredMark(s), !0;
}, my = (e) => ({ tr: t, state: n, dispatch: r }) => {
	let { selection: i } = n, a, o;
	return typeof e == "number" ? (a = e, o = e) : e && "from" in e && "to" in e ? (a = e.from, o = e.to) : (a = i.from, o = i.to), r && t.doc.nodesBetween(a, o, (e, n) => {
		if (e.isText) return;
		let r = { ...e.attrs };
		delete r.dir, t.setNodeMarkup(n, void 0, r);
	}), !0;
}, hy = (e, t = {}) => ({ tr: n, state: r, dispatch: i }) => {
	let a = null, o = null, s = C_(typeof e == "string" ? e : e.name, r.schema);
	if (!s) return !1;
	s === "node" && (a = W(e, r.schema)), s === "mark" && (o = zg(e, r.schema));
	let c = !1;
	return n.selection.ranges.forEach((e) => {
		let s = e.$from.pos, l = e.$to.pos, u, d, f, p;
		n.selection.empty ? r.doc.nodesBetween(s, l, (e, t) => {
			a && a === e.type && (c = !0, f = Math.max(t, s), p = Math.min(t + e.nodeSize, l), u = t, d = e);
		}) : r.doc.nodesBetween(s, l, (e, r) => {
			r < s && a && a === e.type && (c = !0, f = Math.max(r, s), p = Math.min(r + e.nodeSize, l), u = r, d = e), r >= s && r <= l && (a && a === e.type && (c = !0, i && n.setNodeMarkup(r, void 0, {
				...e.attrs,
				...t
			})), o && e.marks.length && e.marks.forEach((a) => {
				if (o === a.type && (c = !0, i)) {
					let i = Math.max(r, s), c = Math.min(r + e.nodeSize, l);
					n.addMark(i, c, o.create({
						...a.attrs,
						...t
					}));
				}
			}));
		}), d && (u !== void 0 && i && n.setNodeMarkup(u, void 0, {
			...d.attrs,
			...t
		}), o && d.marks.length && d.marks.forEach((e) => {
			o === e.type && i && n.addMark(f, p, o.create({
				...e.attrs,
				...t
			}));
		}));
	}), c;
}, gy = new B("__tiptap_decorations__"), _y = (e) => ({ tr: t, dispatch: n }) => (n && t.setMeta(gy, {
	type: "force",
	name: e
}), !0), vy = (e, t = {}) => ({ state: n, dispatch: r }) => Ju(W(e, n.schema), t)(n, r), yy = (e, t = {}) => ({ state: n, dispatch: r }) => td(W(e, n.schema), t)(n, r), by = /* @__PURE__ */ us({
	blur: () => yg,
	clearContent: () => bg,
	clearNodes: () => xg,
	command: () => Sg,
	createParagraphNear: () => Cg,
	cut: () => wg,
	deleteCurrentNode: () => Tg,
	deleteNode: () => Eg,
	deleteRange: () => Dg,
	deleteSelection: () => jg,
	enter: () => Mg,
	exitCode: () => Ng,
	extendMarkRange: () => Bg,
	first: () => Vg,
	focus: () => Jg,
	forEach: () => Yg,
	insertContent: () => Xg,
	insertContentAt: () => r_,
	insertDefaultBlock: () => a_,
	joinBackward: () => c_,
	joinDown: () => s_,
	joinForward: () => l_,
	joinItemBackward: () => d_,
	joinItemForward: () => f_,
	joinTextblockBackward: () => p_,
	joinTextblockForward: () => m_,
	joinUp: () => o_,
	keyboardShortcut: () => __,
	lift: () => y_,
	liftEmptyBlock: () => b_,
	liftListItem: () => x_,
	newlineInCode: () => S_,
	resetAttributes: () => T_,
	scrollIntoView: () => E_,
	selectAll: () => D_,
	selectNodeBackward: () => O_,
	selectNodeForward: () => k_,
	selectParentNode: () => A_,
	selectTextblockEnd: () => j_,
	selectTextblockStart: () => M_,
	setContent: () => P_,
	setMark: () => zv,
	setMeta: () => Bv,
	setNode: () => Vv,
	setNodeSelection: () => Hv,
	setTextDirection: () => Uv,
	setTextSelection: () => Wv,
	sinkListItem: () => Gv,
	splitBlock: () => qv,
	splitListItem: () => Jv,
	toggleList: () => sy,
	toggleMark: () => cy,
	toggleNode: () => ly,
	toggleWrap: () => uy,
	undoInputRule: () => dy,
	unsetAllMarks: () => fy,
	unsetMark: () => py,
	unsetTextDirection: () => my,
	updateAttributes: () => hy,
	updateDecorations: () => _y,
	wrapIn: () => vy,
	wrapInList: () => yy
}), xy = /* @__PURE__ */ new WeakMap();
function Sy(e, t) {
	xy.set(e, (xy.get(e) ?? 0) + 1);
	try {
		return t();
	} finally {
		let t = (xy.get(e) ?? 1) - 1;
		t > 0 ? xy.set(e, t) : xy.delete(e);
	}
}
function Cy(e) {
	return xy.has(e);
}
var wy = class {
	constructor() {
		this.callbacks = {};
	}
	on(e, t) {
		return this.callbacks[e] || (this.callbacks[e] = []), this.callbacks[e].push(t), this;
	}
	emit(e, ...t) {
		let n = this.callbacks[e];
		return n && n.forEach((e) => e.apply(this, t)), this;
	}
	off(e, t) {
		let n = this.callbacks[e];
		return n && (t ? this.callbacks[e] = n.filter((e) => e !== t) : delete this.callbacks[e]), this;
	}
	once(e, t) {
		let n = (...r) => {
			this.off(e, n), t.apply(this, r);
		};
		return this.on(e, n);
	}
	removeAllListeners() {
		this.callbacks = {};
	}
}, Ty = typeof process < "u" && process.env.NODE_ENV !== "production";
function Ey(e) {
	return e.kind === "widget";
}
function Dy(e, t) {
	let n = [], r = /* @__PURE__ */ new Set();
	for (let i of e) i.kind === "widget" && Ey(i) && r.add(i.key), n.push(i.toPMDecoration(t));
	return {
		decorations: n,
		widgetKeys: r
	};
}
function Oy(e, t, n) {
	let { decorations: r, widgetKeys: i } = Dy(t, n);
	return {
		set: U.create(e, r),
		widgetKeys: i
	};
}
function ky({ position: e, from: t, to: n, docSize: r }) {
	return e < t ? !1 : e < n || e === n && n === r;
}
function Ay({ decorations: e, from: t, to: n, docSize: r, extensionName: i, warnedExtensions: a }) {
	return e.filter((e) => ky({
		position: e.anchor,
		from: t,
		to: n,
		docSize: r
	}) ? !0 : (e.anchor === n || a.has(i) || (a.add(i), console.warn(`[tiptap warn]: Extension "${i}" returned a decoration outside the requested range [${t}, ${n}). It was ignored.`)), !1));
}
function jy(e) {
	let t = e.spec?.key;
	return typeof t == "string" ? t : void 0;
}
function My(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
	for (let r of e.find()) {
		let e = jy(r);
		if (!e) continue;
		let i = r.spec.extensionName ?? "unknown", a = t.get(e) ?? /* @__PURE__ */ new Set();
		a.add(i), t.set(e, a), n.set(e, (n.get(e) ?? 0) + 1);
	}
	return Array.from(t, ([e, t]) => ({
		key: e,
		extensions: t
	})).filter(({ key: e }) => (n.get(e) ?? 0) > 1);
}
function Ny(e) {
	return e.jsonID === "attr";
}
function Py(e) {
	let t = !1;
	if (e.getMap().forEach(() => {
		t = !0;
	}), t || Ny(e)) return !0;
	let n = e;
	return typeof n.from == "number" && typeof n.to == "number";
}
function Fy(e, t) {
	let n = null, r = 0, i = 0;
	for (let a = 0; a < e.childCount && !(i > t.to); a += 1) {
		let o = i + e.child(a).nodeSize;
		o >= t.from && (n === null && (n = i), r = o), i = o;
	}
	return n === null ? null : {
		from: n,
		to: r
	};
}
function Iy(e, t) {
	if (e.steps.some((e) => !Py(e))) return { type: "full" };
	let n = vv(e).map(({ newRange: e }) => e);
	e.steps.forEach((t, r) => {
		if (!Ny(t)) return;
		let i = e.mapping.slice(r);
		n.push({
			from: i.map(t.pos, -1),
			to: i.map(t.pos + 1)
		});
	});
	let r = [];
	for (let e of n) {
		let n = Fy(t, e);
		n && r.push(n);
	}
	r.sort((e, t) => e.from - t.from);
	let i = [];
	for (let e of r) {
		let t = i[i.length - 1];
		t && e.from <= t.to ? t.to = Math.max(t.to, e.to) : i.push({ ...e });
	}
	return {
		type: "ranges",
		ranges: i
	};
}
function Ly(e, t, n, r) {
	return e.map(t, n, { onRemove: (e) => {
		let t = e?.key;
		typeof t == "string" && r.delete(t);
	} });
}
function Ry(e, t, n) {
	let r = t.decorationSetsByExtension[e] ?? U.empty, i = new Set(t.widgetKeysByExtension[e] ?? []);
	return {
		set: Ly(r, n.mapping, n.doc, i),
		widgetKeys: i
	};
}
function zy(e, t) {
	let n = Object.values(t).flatMap((e) => e.find());
	return U.create(e, n);
}
function By(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of Object.values(e)) for (let e of n) t.add(e);
	return t;
}
function Vy(e, t) {
	switch (t.update ?? "document") {
		case "document":
			if (t.createInRange) throw Error(`[tiptap error]: Extension "${e}" provides createInRange() but does not use the "changedRanges" decoration update strategy.`);
			return;
		case "changedRanges":
			if (!t.createInRange) throw Error(`[tiptap error]: Extension "${e}" uses the "changedRanges" decoration update strategy but does not provide createInRange().`);
			return;
		case "manual":
			if (t.createInRange) throw Error(`[tiptap error]: Extension "${e}" uses the "manual" decoration update strategy, which is not compatible with createInRange(). createInRange() requires the "changedRanges" strategy.`);
			if (t.shouldUpdate) throw Error(`[tiptap error]: Extension "${e}" cannot combine the "manual" decoration update strategy with shouldUpdate().`);
			return;
		default: throw Error(`[tiptap error]: Extension "${e}" uses an unknown decoration update strategy. Expected "document", "changedRanges", or "manual".`);
	}
}
function Hy(e, t, n) {
	return n ? !0 : e.update === "manual" ? !1 : e.shouldUpdate ? e.shouldUpdate(t) : t.tr.docChanged;
}
var Uy = /* @__PURE__ */ new Set(), Wy = class {
	constructor(e) {
		this.warnedWidgetKeys = /* @__PURE__ */ new Set(), this.warnedOutOfRangeExtensions = /* @__PURE__ */ new Set(), this.handleBeforeTransaction = ({ nextState: e }) => {
			let t = gy.getState(e);
			t && this.warnDuplicateWidgetKeys(t);
		}, this.editor = e.editor, this.entries = this.resolveEntries(e.entries), this.entries.forEach(({ name: e, spec: t }) => Vy(e, t)), this.plugin = this.entries.length > 0 ? this.createPlugin() : null, this.editor.on("beforeTransaction", this.handleBeforeTransaction);
	}
	destroy() {
		this.editor.off("beforeTransaction", this.handleBeforeTransaction);
	}
	liveWidgetKeys() {
		return gy.getState(this.editor.state)?.widgetKeys ?? Uy;
	}
	get mountedView() {
		return this.editor.isDestroyed ? null : this.editor.view;
	}
	resolveEntries(e) {
		let t = [];
		for (let { name: n, addDecorations: r } of e) {
			let e = r();
			e && t.push({
				name: n,
				spec: e
			});
		}
		return t;
	}
	createPlugin() {
		let { editor: e, entries: t } = this;
		return new z({
			key: gy,
			state: {
				init: (e, n) => {
					let r = {}, i = {};
					for (let { name: e, spec: a } of t) {
						let { set: t, widgetKeys: o } = this.buildFullSet(e, a, n);
						r[e] = t, i[e] = o;
					}
					let a = {
						decorationSetsByExtension: r,
						widgetKeysByExtension: i,
						mergedDecorationSet: this.buildMergedSet(n.doc, r),
						widgetKeys: By(i)
					};
					return this.warnDuplicateWidgetKeys(a), a;
				},
				apply: (n, r, i, a) => {
					let o = n.getMeta(gy), s = o?.type === "force" && !o.name, c = o?.type === "force" ? o.name : void 0, l = {}, u = {}, d = /* @__PURE__ */ new Set();
					return Sy(e, () => {
						for (let { name: o, spec: f } of t) {
							let t = s || c === o;
							if (!Hy(f, {
								editor: e,
								tr: n,
								oldState: i,
								newState: a
							}, t)) {
								let e = Ry(o, r, n);
								l[o] = e.set, u[o] = e.widgetKeys;
							} else if (f.update === "changedRanges" && n.docChanged && !t) {
								let e = this.applyChangedRangesRecompute(o, f, r, n, a);
								l[o] = e.set, u[o] = e.widgetKeys, d.add(o);
							} else {
								let { set: e, widgetKeys: t } = this.buildFullSet(o, f, a);
								l[o] = e, u[o] = t, d.add(o);
							}
						}
					}), d.size === 0 && !n.docChanged ? r : {
						decorationSetsByExtension: l,
						widgetKeysByExtension: u,
						mergedDecorationSet: this.mergeAfterApply({
							entries: t,
							previous: r,
							tr: n,
							decorationSetsByExtension: l,
							recomputedNames: d
						}),
						widgetKeys: By(u)
					};
				}
			},
			props: { decorations(e) {
				return gy.getState(e)?.mergedDecorationSet ?? U.empty;
			} }
		});
	}
	applyChangedRangesRecompute(e, t, n, r, i) {
		let a = Iy(r, i.doc);
		return a.type === "full" ? this.buildFullSet(e, t, i) : this.rebuildRanges(e, t, n, r, i, a.ranges);
	}
	rebuildRanges(e, t, n, r, i, a) {
		let o = n.decorationSetsByExtension[e] ?? U.empty, s = new Set(n.widgetKeysByExtension[e] ?? []), c = Ly(o, r.mapping, r.doc, s), l = i.doc.content.size;
		for (let { from: n, to: r } of a) {
			let a = c.find(n, r).filter((e) => ky({
				position: e.from,
				from: n,
				to: r,
				docSize: l
			}));
			for (let e of a) {
				let t = jy(e);
				t && s.delete(t);
			}
			c = c.remove(a);
			let { decorations: o, widgetKeys: u } = Dy(Ay({
				decorations: this.runCreate(e, "createInRange", () => t.createInRange({
					editor: this.editor,
					state: i,
					view: this.mountedView,
					from: n,
					to: r
				})),
				from: n,
				to: r,
				docSize: l,
				extensionName: e,
				warnedExtensions: this.warnedOutOfRangeExtensions
			}), e);
			c = c.add(i.doc, o);
			for (let e of u) s.add(e);
		}
		return {
			set: c,
			widgetKeys: s
		};
	}
	buildFullSet(e, t, n) {
		let r = this.runCreate(e, "create", () => t.create({
			editor: this.editor,
			state: n,
			view: this.mountedView
		}));
		return Oy(n.doc, r, e);
	}
	runCreate(e, t, n) {
		try {
			return n();
		} catch (n) {
			return console.error(`[tiptap error]: Extension "${e}" threw in \`addDecorations().${t}()\`. Its decorations were dropped for this update.`, n), [];
		}
	}
	warnDuplicateWidgetKeys(e) {
		if (!Ty) return;
		if (e.widgetKeys.size === 0) {
			this.warnedWidgetKeys.clear();
			return;
		}
		let t = My(e.mergedDecorationSet), n = new Set(t.map(({ key: e }) => e));
		for (let { key: e, extensions: n } of t) {
			if (this.warnedWidgetKeys.has(e)) continue;
			let t = Array.from(n).map((e) => `"${e}"`).join(", ");
			console.warn(`[tiptap warn]: Duplicate widget decoration key "${e}" in extension${n.size === 1 ? "" : "s"} ${t}. Widget decoration keys must be globally unique, otherwise ProseMirror misplaces the widget DOM. Use a stable, unique key (e.g. \`comment-\${id}\`).`);
		}
		this.warnedWidgetKeys = n;
	}
	buildMergedSet(e, t) {
		let n = Object.keys(t);
		return n.length === 1 ? t[n[0]] : zy(e, t);
	}
	mergeAfterApply({ entries: e, previous: t, tr: n, decorationSetsByExtension: r, recomputedNames: i }) {
		return e.length === 1 ? r[e[0].name] : i.size === 0 ? t.mergedDecorationSet.map(n.mapping, n.doc) : zy(n.doc, r);
	}
};
function Gy(e, t) {
	let { selection: n } = e, { $from: r } = n;
	if (n instanceof R) {
		let e = r.index();
		return r.parent.canReplaceWith(e, e + 1, t);
	}
	let i = r.depth;
	for (; i >= 0;) {
		let e = r.index(i);
		if (r.node(i).contentMatchAt(e).matchType(t)) return !0;
		--i;
	}
	return !1;
}
function Ky(e, t, n) {
	let r = document.querySelector(`style[data-tiptap-style${n ? `-${n}` : ""}]`);
	if (r !== null) return r;
	let i = document.createElement("style");
	return t && i.setAttribute("nonce", t), i.setAttribute(`data-tiptap-style${n ? `-${n}` : ""}`, ""), i.innerHTML = e, document.getElementsByTagName("head")[0].appendChild(i), i;
}
function qy(e) {
	return typeof e == "number";
}
function Jy(e) {
	return Object.prototype.toString.call(e).slice(8, -1);
}
function Yy(e) {
	return Jy(e) === "Object" && e.constructor === Object && Object.getPrototypeOf(e) === Object.prototype;
}
function Xy(e, t) {
	return e.replace(/^[ \t]*/, (e) => {
		let n = 0;
		for (let t of e) n += t === "	" ? 4 - n % 4 : 1;
		return " ".repeat(Math.max(0, n - t));
	});
}
function Zy(e, t) {
	let n = `text\n${e}\n`, r = t(n)[0];
	return (r?.type === "paragraph" || r?.type === "text") && r.raw === n;
}
function Qy(e, t, n) {
	let r = t.split("\n"), i = n.isParagraphContinuation ?? ((e) => Zy(e, n.blockTokens)), a = 0;
	for (let e of r) {
		if (!e.trim() || !i(e)) break;
		a += 1;
	}
	return {
		mainContent: [e, ...r.slice(0, a).map((e) => e.trimStart())].join("\n"),
		nestedContent: r.slice(a).join("\n")
	};
}
function $y(e, t, n) {
	let r = e.split("\n"), i = [], a = "", o = 0, s = t.baseIndentSize || 2;
	for (; o < r.length;) {
		let e = r[o], u = e.match(t.itemPattern);
		if (!u) {
			if (i.length > 0) break;
			if (e.trim() === "") {
				o += 1, a = `${a}${e}\n`;
				continue;
			}
			return;
		}
		let d = t.extractItemData(u), { indentLevel: f, mainContent: p } = d;
		a = `${a}${e}\n`;
		let m = [p];
		for (o += 1; o < r.length;) {
			var c;
			let e = r[o];
			if (e.trim() === "") {
				var l;
				let t = r.slice(o + 1).findIndex((e) => e.trim() !== "");
				if (t === -1) break;
				if ((((l = r[o + 1 + t].match(/^(\s*)/)) == null || (l = l[1]) == null ? void 0 : l.length) || 0) > f) {
					m.push(e), a = `${a}${e}\n`, o += 1;
					continue;
				}
				break;
			}
			if ((((c = e.match(/^(\s*)/)) == null || (c = c[1]) == null ? void 0 : c.length) || 0) > f) m.push(e), a = `${a}${e}\n`, o += 1;
			else break;
		}
		let h, g = m.slice(1);
		if (g.length > 0) {
			let e = Qy(p, g.map((e) => Xy(e, f + s)).join("\n"), n);
			d.mainContent = e.mainContent;
			let r = e.nestedContent;
			r.trim() && (h = t.customNestedParser ? t.customNestedParser(r) : n.blockTokens(r));
		}
		let _ = t.createToken(d, h);
		i.push(_);
	}
	if (i.length !== 0) return {
		items: i,
		raw: a.slice(0, e.length)
	};
}
var eb = 4;
function tb(e) {
	let t = 0;
	for (let n of e) t = n === "	" ? t + eb - t % eb : t + 1;
	return t;
}
function nb(e, t, n, r, i) {
	if (!e || !Array.isArray(e.content)) return "";
	let a = typeof n == "function" ? n(r) : n, [o, ...s] = e.content, c = t.renderChildren([o]), l = `${a}${i?.indentMainContent ? c.split("\n").map((e, n) => n === 0 ? e : t.indent(e)).join("\n") : c}`;
	return s && s.length > 0 && s.forEach((e, n) => {
		let r = t.renderChild?.call(t, e, n + 1) ?? t.renderChildren([e]);
		if (r != null) {
			let n = (e) => {
				if (!i?.alignNestedToPrefix) return t.indent(e);
				let n = t.indent(""), r = tb(a);
				return (tb(n) >= r ? n : " ".repeat(r)) + e;
			}, o = r.split("\n").map((e) => n(e || "")).join("\n");
			l += e.type === "paragraph" ? `\n\n${o}` : `\n${o}`;
		}
	}), l;
}
function rb(e, t) {
	let n = { ...e };
	return Yy(e) && Yy(t) && Object.keys(t).forEach((r) => {
		Yy(t[r]) && Yy(e[r]) ? n[r] = rb(e[r], t[r]) : n[r] = t[r];
	}), n;
}
function ib(e, t, n = {}) {
	let { state: r } = t, { doc: i, tr: a } = r, o = e;
	i.descendants((t, r) => {
		let i = a.mapping.map(r), s = a.mapping.map(r) + t.nodeSize, c = null;
		if (t.marks.forEach((e) => {
			if (e !== o) return !1;
			c = e;
		}), !c) return;
		let l = !1;
		if (Object.keys(n).forEach((e) => {
			n[e] !== c.attrs[e] && (l = !0);
		}), l) {
			let t = e.type.create({
				...e.attrs,
				...n
			});
			a.removeMark(i, s, e.type), a.addMark(i, s, t);
		}
	}), a.docChanged && t.view.dispatch(a);
}
var ab = class {
	constructor(e) {
		this.find = e.find, this.handler = e.handler, this.undoable = e.undoable ?? !0;
	}
}, ob = (e, t) => {
	if (Pg(t)) return t.exec(e);
	let n = t(e);
	if (!n) return null;
	let r = [n.text];
	return r.index = n.index, r.input = e, r.data = n.data, n.replaceWith && (n.text.includes(n.replaceWith) || console.warn("[tiptap warn]: \"inputRuleMatch.replaceWith\" must be part of \"inputRuleMatch.text\"."), r.push(n.replaceWith)), r;
};
function sb(e) {
	let { editor: t, from: n, to: r, text: i, insertText: a } = e;
	if (!a) return {
		inputTransaction: null,
		tr: t.view.state.tr
	};
	let o = t.view.state.tr.insertText(i, n, r);
	return {
		inputTransaction: o,
		tr: mu.create({
			doc: o.doc,
			selection: o.selection,
			storedMarks: o.storedMarks
		}).tr
	};
}
function cb(e) {
	let { editor: t, from: n, to: r, text: i, rule: a, match: o, plugin: s, insertText: c } = e, { view: l } = t, { inputTransaction: u, tr: d } = sb({
		editor: t,
		from: n,
		to: r,
		text: i,
		insertText: c
	}), f = u ? n + i.length : r, p = _g({
		state: l.state,
		transaction: d
	}), m = {
		from: n - (o[0].length - i.length),
		to: f
	}, { commands: h, chain: g, can: _ } = new vg({
		editor: t,
		state: p
	});
	return a.handler({
		state: p,
		range: m,
		match: o,
		commands: h,
		chain: g,
		can: _
	}) === null || !d.steps.length ? !1 : (u && (l.dispatch(u), !l.state.doc.eq(u.doc)) || (lg(d), d.setMeta("inputRule", !0), a.undoable && d.setMeta(s, {
		transform: d,
		from: n,
		to: f,
		text: i
	}), l.dispatch(d)), !0);
}
function lb(e, t, n) {
	let r = t[0].length - n.length;
	if (r <= 0) return !0;
	let i = e.parentOffset - r;
	return i >= 0 && e.parent.textBetween(i, e.parentOffset) === t[0].slice(0, r);
}
function ub(e) {
	let { editor: t, from: n, to: r, text: i, rules: a, plugin: o, insertText: s } = e, { view: c } = t;
	if (c.composing) return !1;
	let l = c.state.doc.resolve(n);
	if (l.parent.type.spec.code || (l.nodeBefore || l.nodeAfter)?.marks.find((e) => e.type.spec.code)) return !1;
	let u = wv(l) + i;
	for (let e of a) {
		let a = ob(u, e.find);
		if (a && lb(l, a, i) && cb({
			editor: t,
			from: n,
			to: r,
			text: i,
			rule: e,
			match: a,
			plugin: o,
			insertText: s
		})) return !0;
	}
	return !1;
}
function db(e) {
	let { editor: t, rules: n } = e, r = new z({
		state: {
			init() {
				return null;
			},
			apply(e, i, a) {
				let o = e.getMeta(r);
				if (o) return o;
				if (i && e.getMeta("appendedTransaction")?.getMeta(r)) {
					let t = new Yl(i.transform.before);
					for (let n of [...i.transform.steps, ...e.steps]) t.step(n);
					return {
						...i,
						transform: t
					};
				}
				let s = e.getMeta("applyInputRules");
				return s && setTimeout(() => {
					let { text: e } = s;
					e = typeof e == "string" ? e : V_(M.from(e), a.schema);
					let { from: i } = s, o = i + e.length;
					ub({
						editor: t,
						from: i,
						to: o,
						text: e,
						rules: n,
						plugin: r
					});
				}), e.selectionSet || e.docChanged ? null : i;
			}
		},
		props: {
			handleTextInput(e, i, a, o) {
				return ub({
					editor: t,
					from: i,
					to: a,
					text: o,
					rules: n,
					plugin: r,
					insertText: !0
				});
			},
			handleDOMEvents: { compositionend: (e) => (setTimeout(() => {
				let { $cursor: i } = e.state.selection;
				i && ub({
					editor: t,
					from: i.pos,
					to: i.pos,
					text: "",
					rules: n,
					plugin: r
				});
			}), !1) },
			handleKeyDown(e, i) {
				if (i.key !== "Enter") return !1;
				let { $cursor: a } = e.state.selection;
				return a ? ub({
					editor: t,
					from: a.pos,
					to: a.pos,
					text: "\n",
					rules: n,
					plugin: r
				}) : !1;
			}
		},
		isInputRules: !0
	});
	return r;
}
var fb = class {
	constructor(e = {}) {
		this.type = "extendable", this.parent = null, this.child = null, this.name = "", this.config = { name: this.name }, this.config = {
			...this.config,
			...e
		}, this.name = this.config.name;
	}
	get options() {
		return { ...K(G(this, "addOptions", { name: this.name })) };
	}
	get storage() {
		return { ...K(G(this, "addStorage", {
			name: this.name,
			options: this.options
		})) };
	}
	configure(e = {}) {
		let t = this.extend({
			...this.config,
			addOptions: () => rb(this.options, e)
		});
		return t.name = this.name, t.parent = this.parent, this.child = null, t;
	}
	extend(e = {}) {
		let t = new this.constructor({
			...this.config,
			...e
		});
		return t.parent = this, this.child = t, t.name = "name" in e ? e.name : t.parent.name, t;
	}
}, pb = class e extends fb {
	constructor(...e) {
		super(...e), this.type = "mark";
	}
	static create(t = {}) {
		let n = typeof t == "function" ? t() : t;
		return new e(n);
	}
	static handleExit({ editor: e, mark: t }) {
		let { tr: n } = e.state, r = e.state.selection.$from;
		if (r.pos === r.end()) {
			let i = r.marks();
			if (!i.find((e) => e?.type.name === t.name)) return !1;
			let a = i.find((e) => e?.type.name === t.name);
			return a && n.removeStoredMark(a), n.insertText(" ", r.pos), e.view.dispatch(n), !0;
		}
		return !1;
	}
	configure(e) {
		return super.configure(e);
	}
	extend(e) {
		let t = typeof e == "function" ? e() : e;
		return super.extend(t);
	}
}, mb = class {
	constructor(e) {
		this.find = e.find, this.handler = e.handler;
	}
}, hb = (e, t, n) => {
	if (Pg(t)) return [...e.matchAll(t)];
	let r = t(e, n);
	return r ? r.map((t) => {
		let n = [t.text];
		return n.index = t.index, n.input = e, n.data = t.data, t.replaceWith && (t.text.includes(t.replaceWith) || console.warn("[tiptap warn]: \"pasteRuleMatch.replaceWith\" must be part of \"pasteRuleMatch.text\"."), n.push(t.replaceWith)), n;
	}) : [];
};
function gb(e) {
	let { editor: t, state: n, from: r, to: i, rule: a, pasteEvent: o, dropEvent: s } = e, { commands: c, chain: l, can: u } = new vg({
		editor: t,
		state: n
	}), d = [];
	return n.doc.nodesBetween(r, i, (e, t) => {
		var f;
		if ((f = e.type) != null && (f = f.spec) != null && f.code || !(e.isText || e.isTextblock || e.isInline)) return;
		let p = e.content?.size ?? e.nodeSize ?? 0, m = Math.max(r, t), h = Math.min(i, t + p);
		m >= h || hb(e.isText ? e.text || "" : e.textBetween(m - t, h - t, void 0, "￼"), a.find, o).forEach((e) => {
			if (e.index === void 0) return;
			let t = m + e.index + 1, r = t + e[0].length, i = {
				from: n.tr.mapping.map(t),
				to: n.tr.mapping.map(r)
			}, f = a.handler({
				state: n,
				range: i,
				match: e,
				commands: c,
				chain: l,
				can: u,
				pasteEvent: o,
				dropEvent: s
			});
			d.push(f);
		});
	}), d.every((e) => e !== null);
}
var _b = null, vb = (e) => {
	var t;
	let n = new ClipboardEvent("paste", { clipboardData: new DataTransfer() });
	return (t = n.clipboardData) == null || t.setData("text/html", e), n;
};
function yb(e) {
	let { editor: t, rules: n } = e, r = null, i = !1, a = !1, o = typeof ClipboardEvent < "u" ? new ClipboardEvent("paste") : null, s;
	try {
		s = typeof DragEvent < "u" ? new DragEvent("drop") : null;
	} catch {
		s = null;
	}
	let c = ({ state: e, from: n, to: r, rule: i, pasteEvt: a }) => {
		let c = e.tr, l = _g({
			state: e,
			transaction: c
		});
		if (gb({
			editor: t,
			state: l,
			from: Math.max(n - 1, 0),
			to: r.b - 1,
			rule: i,
			pasteEvent: a,
			dropEvent: s
		}) && c.steps.length) {
			try {
				s = typeof DragEvent < "u" ? new DragEvent("drop") : null;
			} catch {
				s = null;
			}
			return o = typeof ClipboardEvent < "u" ? new ClipboardEvent("paste") : null, c;
		}
	};
	return t.on("destroy", () => {
		_b === t && (_b = null);
	}), n.map((e) => new z({
		view(e) {
			let n = (n) => {
				r = e.dom.parentElement?.contains(n.target) ? e.dom.parentElement : null, r && (_b = t);
			}, i = () => {
				_b &&= null;
			};
			return window.addEventListener("dragstart", n), window.addEventListener("dragend", i), { destroy() {
				window.removeEventListener("dragstart", n), window.removeEventListener("dragend", i);
			} };
		},
		props: { handleDOMEvents: {
			drop: (e, t) => {
				if (a = r === e.dom.parentElement, s = t, !a) {
					let e = _b;
					e?.isEditable && setTimeout(() => {
						if (e.isDestroyed) return;
						let t = e.state.selection;
						t && e.commands.deleteRange({
							from: t.from,
							to: t.to
						});
					}, 10);
				}
				return !1;
			},
			paste: (e, t) => {
				let n = t.clipboardData?.getData("text/html");
				return o = t, i = !!n?.includes("data-pm-slice"), !1;
			}
		} },
		appendTransaction: (t, n, r) => {
			let s = t[0], l = s.getMeta("uiEvent") === "paste" && !i, u = s.getMeta("uiEvent") === "drop" && !a, d = s.getMeta("applyPasteRules"), f = !!d;
			if (!l && !u && !f) return;
			if (f) {
				let { text: t } = d;
				t = typeof t == "string" ? t : V_(M.from(t), r.schema);
				let { from: n } = d, i = n + t.length, a = vb(t);
				return c({
					rule: e,
					state: r,
					from: n,
					to: { b: i },
					pasteEvt: a
				});
			}
			let p = n.doc.content.findDiffStart(r.doc.content), m = n.doc.content.findDiffEnd(r.doc.content);
			if (qy(p) && m && p !== m.b) return c({
				rule: e,
				state: r,
				from: p,
				to: m,
				pasteEvt: o
			});
		}
	}));
}
var bb = class {
	constructor(e, t) {
		this.splittableMarks = [], this.nonClearableMarks = [], this.decorationManager = null, this.editor = t, this.baseExtensions = e, this.extensions = uv(e), this.hasSchemaSpec = t.options.schemaSpec !== void 0, this.schema = cv(this.extensions, t, t.options.schemaSpec), this.setupExtensions();
	}
	get commands() {
		return this.extensions.reduce((e, t) => {
			let n = G(t, "addCommands", {
				name: t.name,
				options: t.options,
				storage: this.editor.extensionStorage[t.name],
				editor: this.editor,
				type: Sv(t.name, this.schema)
			});
			return n ? {
				...e,
				...n()
			} : e;
		}, {});
	}
	get plugins() {
		let { editor: e } = this, t = lv([...this.extensions].reverse()).flatMap((t) => {
			let n = {
				name: t.name,
				options: t.options,
				storage: this.editor.extensionStorage[t.name],
				editor: e,
				type: Sv(t.name, this.schema)
			}, r = [], i = G(t, "addKeyboardShortcuts", n), a = {};
			if (t.type === "mark" && G(t, "exitable", n) && (a.ArrowRight = () => pb.handleExit({
				editor: e,
				mark: t
			})), i) {
				let t = Object.fromEntries(Object.entries(i()).map(([t, n]) => [t, () => n({ editor: e })]));
				a = {
					...a,
					...t
				};
			}
			let o = Hh(a);
			r.push(o);
			let s = G(t, "addInputRules", n);
			if (kv(t, e.options.enableInputRules) && s) {
				let t = s();
				if (t && t.length) {
					let n = db({
						editor: e,
						rules: t
					}), i = Array.isArray(n) ? n : [n];
					r.push(...i);
				}
			}
			let c = G(t, "addPasteRules", n);
			if (kv(t, e.options.enablePasteRules) && c) {
				let t = c();
				if (t && t.length) {
					let n = yb({
						editor: e,
						rules: t
					});
					r.push(...n);
				}
			}
			let l = G(t, "addProseMirrorPlugins", n);
			if (l) {
				let e = l();
				r.push(...e);
			}
			return r;
		}), n = this.createDecorationPlugin();
		return n && t.push(n), t;
	}
	createDecorationPlugin() {
		var e;
		let { editor: t } = this;
		(e = this.decorationManager) == null || e.destroy();
		let n = [];
		return this.extensions.forEach((e) => {
			let r = G(e, "addDecorations", {
				name: e.name,
				options: e.options,
				storage: this.editor.extensionStorage[e.name],
				editor: t,
				type: Sv(e.name, this.schema)
			});
			r && n.push({
				name: e.name,
				addDecorations: r
			});
		}), this.decorationManager = new Wy({
			editor: t,
			entries: n
		}), this.decorationManager.plugin;
	}
	get attributes() {
		let e = Z_(this.extensions);
		return this.hasSchemaSpec ? H_(e, this.schema) : e;
	}
	get nodeViews() {
		let { editor: e } = this, { nodeExtensions: t } = X_(this.extensions);
		return Object.fromEntries(t.filter((e) => !!G(e, "addNodeView")).map((t) => {
			let n = this.attributes.filter((e) => e.type === t.name), r = G(t, "addNodeView", {
				name: t.name,
				options: t.options,
				storage: this.editor.extensionStorage[t.name],
				editor: e,
				type: W(t.name, this.schema)
			});
			if (!r) return [];
			let i = r();
			return i ? [t.name, (r, a, o, s, c) => {
				let l = nv(r, n);
				return i({
					node: r,
					view: a,
					getPos: o,
					decorations: s,
					innerDecorations: c,
					editor: e,
					extension: t,
					HTMLAttributes: l
				});
			}] : [];
		}));
	}
	dispatchTransaction(e) {
		let { editor: t } = this;
		return lv([...this.extensions].reverse()).reduceRight((e, n) => {
			let r = {
				name: n.name,
				options: n.options,
				storage: this.editor.extensionStorage[n.name],
				editor: t,
				type: Sv(n.name, this.schema)
			}, i = G(n, "dispatchTransaction", r);
			return i ? (t) => {
				i.call(r, {
					transaction: t,
					next: e
				});
			} : e;
		}, e);
	}
	transformPastedHTML(e) {
		let { editor: t } = this;
		return lv([...this.extensions]).reduce((e, n) => {
			let r = {
				name: n.name,
				options: n.options,
				storage: this.editor.extensionStorage[n.name],
				editor: t,
				type: Sv(n.name, this.schema)
			}, i = G(n, "transformPastedHTML", r);
			return i ? (t, n) => {
				let a = e(t, n);
				return i.call(r, a);
			} : e;
		}, e || ((e) => e));
	}
	get markViews() {
		let { editor: e } = this, { markExtensions: t } = X_(this.extensions);
		return Object.fromEntries(t.filter((e) => !!G(e, "addMarkView")).map((t) => {
			let n = this.attributes.filter((e) => e.type === t.name), r = G(t, "addMarkView", {
				name: t.name,
				options: t.options,
				storage: this.editor.extensionStorage[t.name],
				editor: e,
				type: zg(t.name, this.schema)
			});
			return r ? [t.name, (i, a, o) => {
				let s = nv(i, n);
				return r()({
					mark: i,
					view: a,
					inline: o,
					editor: e,
					extension: t,
					HTMLAttributes: s,
					updateAttributes: (t) => {
						ib(i, e, t);
					}
				});
			}] : [];
		}));
	}
	destroy() {
		var e;
		(e = this.decorationManager) == null || e.destroy(), this.extensions.forEach((e) => {
			let t = e;
			for (; t.parent;) {
				let e = t.parent;
				e.child === t && (e.child = null), t = e;
			}
		}), this.extensions = [], this.baseExtensions = [], this.decorationManager = null, this.schema = null, this.editor = null;
	}
	setupExtensions() {
		let e = this.extensions;
		this.editor.extensionStorage = Object.fromEntries(e.map((e) => [e.name, e.storage])), e.forEach((e) => {
			let t = {
				name: e.name,
				options: e.options,
				storage: this.editor.extensionStorage[e.name],
				editor: this.editor,
				type: Sv(e.name, this.schema)
			};
			e.type === "mark" && ((K(G(e, "keepOnSplit", t)) ?? !0) && this.splittableMarks.push(e.name), (K(G(e, "clearable", t)) ?? !0) || this.nonClearableMarks.push(e.name));
			let n = G(e, "onBeforeCreate", t), r = G(e, "onCreate", t), i = G(e, "onUpdate", t), a = G(e, "onSelectionUpdate", t), o = G(e, "onTransaction", t), s = G(e, "onFocus", t), c = G(e, "onBlur", t), l = G(e, "onDestroy", t);
			n && this.editor.on("beforeCreate", n), r && this.editor.on("create", r), i && this.editor.on("update", i), a && this.editor.on("selectionUpdate", a), o && this.editor.on("transaction", o), s && this.editor.on("focus", s), c && this.editor.on("blur", c), l && this.editor.on("destroy", l);
		});
	}
};
bb.resolve = uv, bb.sort = lv, bb.flatten = B_;
var J = class e extends fb {
	constructor(...e) {
		super(...e), this.type = "extension";
	}
	static create(t = {}) {
		let n = typeof t == "function" ? t() : t;
		return new e(n);
	}
	configure(e) {
		return super.configure(e);
	}
	extend(e) {
		let t = typeof e == "function" ? e() : e;
		return super.extend(t);
	}
}, xb = J.create({
	name: "clipboardTextSerializer",
	addOptions() {
		return { blockSeparator: void 0 };
	},
	addProseMirrorPlugins() {
		return [new z({
			key: new B("clipboardTextSerializer"),
			props: { clipboardTextSerializer: () => {
				let { editor: e } = this, { state: t, schema: n } = e, { doc: r, selection: i } = t, a = pv(n), { blockSeparator: o } = this.options, s = {
					...o === void 0 ? {} : { blockSeparator: o },
					textSerializers: a
				};
				return [...i.ranges].sort((e, t) => e.$from.pos - t.$from.pos).map(({ $from: e, $to: t }) => dv(r, {
					from: e.pos,
					to: t.pos
				}, s)).join(o ?? "\n\n");
			} }
		})];
	}
}), Sb = J.create({
	name: "commands",
	addCommands() {
		return { ...by };
	}
}), Cb = J.create({
	name: "delete",
	onUpdate({ transaction: e, appendedTransactions: t }) {
		var n;
		let r = () => {
			var n, r;
			if (((n = this.editor.options.coreExtensionOptions) == null || (n = n.delete) == null || (r = n.filterTransaction) == null ? void 0 : r.call(n, e)) ?? e.getMeta("y-sync$")) return;
			let i = I_(e.before, [e, ...t]);
			vv(i).forEach((t) => {
				i.mapping.mapResult(t.oldRange.from).deletedAfter && i.mapping.mapResult(t.oldRange.to).deletedBefore && i.before.nodesBetween(t.oldRange.from, t.oldRange.to, (n, r) => {
					let a = r + n.nodeSize - 2, o = t.oldRange.from <= r && a <= t.oldRange.to;
					this.editor.emit("delete", {
						type: "node",
						node: n,
						from: r,
						to: a,
						newFrom: i.mapping.map(r),
						newTo: i.mapping.map(a),
						deletedRange: t.oldRange,
						newRange: t.newRange,
						partial: !o,
						editor: this.editor,
						transaction: e,
						combinedTransform: i
					});
				});
			});
			let a = i.mapping;
			i.steps.forEach((t, n) => {
				if (t instanceof Zc) {
					let r = a.slice(n).map(t.from, -1), o = a.slice(n).map(t.to), s = a.invert().map(r, -1), c = a.invert().map(o), l = r > 0 && i.doc.nodeAt(r - 1)?.marks.some((e) => e.eq(t.mark)), u = i.doc.nodeAt(o)?.marks.some((e) => e.eq(t.mark));
					this.editor.emit("delete", {
						type: "mark",
						mark: t.mark,
						from: t.from,
						to: t.to,
						deletedRange: {
							from: s,
							to: c
						},
						newRange: {
							from: r,
							to: o
						},
						partial: !!(u || l),
						editor: this.editor,
						transaction: e,
						combinedTransform: i
					});
				}
			});
		};
		((n = this.editor.options.coreExtensionOptions) == null || (n = n.delete) == null ? void 0 : n.async) ?? !0 ? setTimeout(r, 0) : r();
	}
}), wb = J.create({
	name: "drop",
	addProseMirrorPlugins() {
		return [new z({
			key: new B("tiptapDrop"),
			props: { handleDrop: (e, t, n, r) => {
				this.editor.emit("drop", {
					editor: this.editor,
					event: t,
					slice: n,
					moved: r
				});
			} }
		})];
	}
}), Tb = J.create({
	name: "editable",
	addProseMirrorPlugins() {
		return [new z({
			key: new B("editable"),
			props: { editable: () => this.editor.options.editable }
		})];
	}
}), Eb = new B("focusEvents"), Db = J.create({
	name: "focusEvents",
	addProseMirrorPlugins() {
		let { editor: e } = this;
		return [new z({
			key: Eb,
			props: { handleDOMEvents: {
				focus: (t, n) => {
					e.isFocused = !0;
					let r = e.state.tr.setMeta("focus", { event: n }).setMeta("addToHistory", !1);
					return t.dispatch(r), !1;
				},
				blur: (t, n) => {
					e.isFocused = !1;
					let r = e.state.tr.setMeta("blur", { event: n }).setMeta("addToHistory", !1);
					return t.dispatch(r), !1;
				}
			} }
		})];
	}
});
function Ob(e) {
	let { empty: t, from: n, to: r } = e.selection;
	return !t && n === I.atStart(e.doc).from && r === I.atEnd(e.doc).to;
}
var kb = J.create({
	name: "keymap",
	addKeyboardShortcuts() {
		let e = () => this.editor.commands.first(({ commands: e }) => [
			() => e.undoInputRule(),
			() => e.command(({ tr: t }) => {
				let { selection: n, doc: r } = t, { empty: i, $anchor: a } = n, { pos: o, parent: s } = a, c = a.parent.isTextblock && o > 0 ? t.doc.resolve(o - 1) : a, l = c.parent.type.spec.isolating, u = a.pos - a.parentOffset, d = l && c.parent.childCount === 1 ? u === a.pos : I.atStart(r).from === o;
				return !i || !s.type.isTextblock || s.textContent.length || !d || d && a.parent.type.name === "paragraph" ? !1 : e.clearNodes();
			}),
			() => e.deleteSelection(),
			() => e.joinBackward(),
			() => e.selectNodeBackward()
		]), t = () => this.editor.commands.first(({ commands: e }) => [
			() => e.deleteSelection(),
			() => e.deleteCurrentNode(),
			() => e.joinForward(),
			() => e.selectNodeForward()
		]), n = {
			Enter: () => this.editor.commands.first(({ commands: e }) => [
				() => e.newlineInCode(),
				() => e.createParagraphNear(),
				() => e.liftEmptyBlock(),
				() => e.splitBlock()
			]),
			"Mod-Enter": () => this.editor.commands.exitCode(),
			Backspace: e,
			"Mod-Backspace": e,
			"Shift-Backspace": e,
			Delete: t,
			"Mod-Delete": t,
			"Mod-a": () => this.editor.commands.selectAll()
		}, r = { ...n }, i = {
			...n,
			"Ctrl-h": e,
			"Alt-Backspace": e,
			"Ctrl-d": t,
			"Ctrl-Alt-Backspace": t,
			"Alt-Delete": t,
			"Alt-d": t,
			"Ctrl-a": () => this.editor.commands.selectTextblockStart(),
			"Ctrl-e": () => this.editor.commands.selectTextblockEnd()
		};
		return Kg() || h_() ? i : r;
	},
	addProseMirrorPlugins() {
		return [new z({
			key: new B("clearDocument"),
			appendTransaction: (e, t, n) => {
				if (e.some((e) => e.getMeta("composition"))) return;
				let r = e.some((e) => e.docChanged) && !t.doc.eq(n.doc), i = e.some((e) => e.getMeta("preventClearDocument"));
				if (!r || i || !Ob(t) || !jv(n.doc)) return;
				let a = n.tr, o = _g({
					state: n,
					transaction: a
				}), { commands: s } = new vg({
					editor: this.editor,
					state: o
				});
				if (s.clearNodes(), a.steps.length || n.storedMarks) return a.setStoredMarks(null);
			}
		})];
	}
}), Ab = J.create({
	name: "paste",
	addProseMirrorPlugins() {
		return [new z({
			key: new B("tiptapPaste"),
			props: { handlePaste: (e, t, n) => {
				this.editor.emit("paste", {
					editor: this.editor,
					event: t,
					slice: n
				});
			} }
		})];
	}
}), jb = J.create({
	name: "tabindex",
	addOptions() {
		return { value: void 0 };
	},
	addProseMirrorPlugins() {
		return [new z({
			key: new B("tabindex"),
			props: { attributes: () => !this.editor.isEditable && this.options.value === void 0 ? {} : { tabindex: this.options.value ?? "0" } }
		})];
	}
}), Mb = J.create({
	name: "textDirection",
	addOptions() {
		return { direction: void 0 };
	},
	addGlobalAttributes() {
		if (!this.options.direction) return [];
		let { nodeExtensions: e } = X_(this.extensions);
		return [{
			types: e.filter((e) => e.name !== "text").map((e) => e.name),
			attributes: { dir: {
				default: this.options.direction,
				parseHTML: (e) => {
					let t = e.getAttribute("dir");
					return t && (t === "ltr" || t === "rtl" || t === "auto") ? t : this.options.direction;
				},
				renderHTML: (e) => e.dir ? { dir: e.dir } : {}
			} }
		}];
	},
	addProseMirrorPlugins() {
		return [new z({
			key: new B("textDirection"),
			props: { attributes: () => {
				let e = this.options.direction;
				return e ? { dir: e } : {};
			} }
		})];
	}
}), Nb = !1;
function Pb(e) {
	if (Nb) return;
	Nb = !0;
	let t;
	try {
		let n = nl.fromJSON(e, {
			from: 0,
			to: 0
		});
		if (!Pv(n)) return;
		t = n.slice.content;
	} catch {
		return;
	}
	t instanceof M || console.warn("[tiptap warn]: prosemirror-model is loaded more than once. Wrapping and splitting nodes will fail. Deduplicate it in your lock file, or alias it to a single copy in your bundler.");
}
var Fb = class e {
	get name() {
		return this.node.type.name;
	}
	constructor(e, t, n = !1, r = null) {
		this.currentNode = null, this.actualDepth = null, this.isBlock = n, this.resolvedPos = e, this.editor = t, this.currentNode = r;
	}
	get node() {
		return this.currentNode || this.resolvedPos.node();
	}
	get element() {
		return this.editor.view.domAtPos(this.pos).node;
	}
	get depth() {
		return this.actualDepth ?? this.resolvedPos.depth;
	}
	get pos() {
		return this.resolvedPos.pos;
	}
	get content() {
		return this.node.content;
	}
	set content(e) {
		let t = this.from, n = this.to;
		if (this.isBlock) {
			if (this.content.size === 0) {
				console.error(`You can’t set content on a block node. Tried to set content on ${this.name} at ${this.pos}`);
				return;
			}
			t = this.from + 1, n = this.to - 1;
		}
		this.editor.commands.insertContentAt({
			from: t,
			to: n
		}, e);
	}
	get attributes() {
		return this.node.attrs;
	}
	get textContent() {
		return this.node.textContent;
	}
	get size() {
		return this.node.nodeSize;
	}
	get from() {
		return this.isBlock ? this.pos : this.resolvedPos.start(this.resolvedPos.depth);
	}
	get range() {
		return {
			from: this.from,
			to: this.to
		};
	}
	get to() {
		return this.isBlock ? this.pos + this.size : this.resolvedPos.end(this.resolvedPos.depth) + +!this.node.isText;
	}
	get parent() {
		if (this.depth === 0) return null;
		let t = this.resolvedPos.start(this.resolvedPos.depth - 1), n = this.resolvedPos.doc.resolve(t);
		return new e(n, this.editor);
	}
	get before() {
		let t = this.resolvedPos.doc.resolve(this.from - (this.isBlock ? 1 : 2));
		return t.depth !== this.depth && (t = this.resolvedPos.doc.resolve(this.from - 3)), new e(t, this.editor);
	}
	get after() {
		let t = this.resolvedPos.doc.resolve(this.to + (this.isBlock ? 2 : 1));
		return t.depth !== this.depth && (t = this.resolvedPos.doc.resolve(this.to + 3)), new e(t, this.editor);
	}
	get children() {
		let t = [];
		return this.node.content.forEach((n, r) => {
			let i = n.isBlock && !n.isTextblock, a = n.isAtom && !n.isText, o = n.isInline, s = this.pos + r + +!a;
			if (s < 0 || s > this.resolvedPos.doc.nodeSize - 2) return;
			let c = this.resolvedPos.doc.resolve(s);
			if (!i && !o && c.depth <= this.depth) return;
			let l = new e(c, this.editor, i, i || o ? n : null);
			i && (l.actualDepth = this.depth + 1), t.push(l);
		}), t;
	}
	get firstChild() {
		return this.children[0] || null;
	}
	get lastChild() {
		let e = this.children;
		return e[e.length - 1] || null;
	}
	closest(e, t = {}) {
		let n = null, r = this.parent;
		for (; r && !n;) {
			if (r.node.type.name === e) {
				if (Object.keys(t).length > 0) {
					let e = r.node.attrs, n = Object.keys(t);
					for (let r = 0; r < n.length; r += 1) {
						let i = n[r];
						if (e[i] !== t[i]) break;
					}
				} else n = r;
			}
			r = r.parent;
		}
		return n;
	}
	querySelector(e, t = {}) {
		return this.querySelectorAll(e, t, !0)[0] || null;
	}
	querySelectorAll(e, t = {}, n = !1) {
		let r = [];
		if (!this.children || this.children.length === 0) return r;
		let i = Object.keys(t);
		return this.children.forEach((a) => {
			n && r.length > 0 || (a.node.type.name === e && i.every((e) => t[e] === a.node.attrs[e]) && r.push(a), n && r.length > 0 || (r = r.concat(a.querySelectorAll(e, t, n))));
		}), r;
	}
	setAttribute(e) {
		let { tr: t } = this.editor.state;
		t.setNodeMarkup(this.from, void 0, {
			...this.node.attrs,
			...e
		}), this.editor.view.dispatch(t);
	}
}, Ib = ".ProseMirror {\n  position: relative;\n}\n\n.ProseMirror {\n  word-wrap: break-word;\n  white-space: pre-wrap;\n  white-space: break-spaces;\n  -webkit-font-variant-ligatures: none;\n  font-variant-ligatures: none;\n  font-feature-settings: \"liga\" 0; /* the above doesn't seem to work in Edge */\n}\n\n.ProseMirror [contenteditable=\"false\"] {\n  white-space: normal;\n}\n\n.ProseMirror [contenteditable=\"false\"] [contenteditable=\"true\"] {\n  white-space: pre-wrap;\n}\n\n.ProseMirror pre {\n  white-space: pre-wrap;\n}\n\nimg.ProseMirror-separator {\n  display: inline !important;\n  border: none !important;\n  margin: 0 !important;\n  width: 0 !important;\n  height: 0 !important;\n}\n\n.ProseMirror-gapcursor {\n  display: none;\n  pointer-events: none;\n  position: absolute;\n  margin: 0;\n}\n\n.ProseMirror-gapcursor:after {\n  content: \"\";\n  display: block;\n  position: absolute;\n  top: -2px;\n  width: 20px;\n  border-top: 1px solid black;\n  animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;\n}\n\n@keyframes ProseMirror-cursor-blink {\n  to {\n    visibility: hidden;\n  }\n}\n\n.ProseMirror-hideselection *::selection {\n  background: transparent;\n}\n\n.ProseMirror-hideselection *::-moz-selection {\n  background: transparent;\n}\n\n.ProseMirror-hideselection * {\n  caret-color: transparent;\n}\n\n.ProseMirror-focused .ProseMirror-gapcursor {\n  display: block;\n}", Lb = class extends wy {
	constructor(e = {}) {
		super(), this.css = null, this.className = "tiptap", this.editorView = null, this.isFocused = !1, this.destroyed = !1, this.isInitialized = !1, this.extensionStorage = {}, this.instanceId = Math.random().toString(36).slice(2, 9), this.hasWarnedStaleDecorationRead = !1, this.options = {
			element: typeof document < "u" ? document.createElement("div") : null,
			content: "",
			injectCSS: !0,
			injectNonce: void 0,
			extensions: [],
			autofocus: !1,
			editable: !0,
			textDirection: void 0,
			editorProps: {},
			parseOptions: {},
			coreExtensionOptions: {},
			enableInputRules: !0,
			enablePasteRules: !0,
			enableCoreExtensions: !0,
			enableContentCheck: !1,
			emitContentError: !1,
			onBeforeCreate: () => null,
			onCreate: () => null,
			onMount: () => null,
			onUnmount: () => null,
			onUpdate: () => null,
			onSelectionUpdate: () => null,
			onTransaction: () => null,
			onFocus: () => null,
			onBlur: () => null,
			onDestroy: () => null,
			onContentError: ({ error: e }) => {
				throw e;
			},
			onPaste: () => null,
			onDrop: () => null,
			onDelete: () => null,
			enableExtensionDispatchTransaction: !0
		}, this.isCapturingTransaction = !1, this.capturedTransaction = null, this.utils = {
			getUpdatedPosition: Iv,
			createMappablePosition: Lv
		}, this.setOptions(e), this.createExtensionManager(), this.createCommandManager(), this.createSchema(), this.on("beforeCreate", this.options.onBeforeCreate), this.emit("beforeCreate", { editor: this }), this.on("mount", this.options.onMount), this.on("unmount", this.options.onUnmount), this.on("contentError", this.options.onContentError), this.on("create", this.options.onCreate), this.on("update", this.options.onUpdate), this.on("selectionUpdate", this.options.onSelectionUpdate), this.on("transaction", this.options.onTransaction), this.on("focus", this.options.onFocus), this.on("blur", this.options.onBlur), this.on("destroy", this.options.onDestroy), this.on("drop", ({ event: e, slice: t, moved: n }) => this.options.onDrop(e, t, n)), this.on("paste", ({ event: e, slice: t }) => this.options.onPaste(e, t)), this.on("delete", this.options.onDelete);
		let t = this.createDoc();
		if (!this.editorState) {
			let e = Wg(t, this.options.autofocus);
			this.editorState = mu.create({
				doc: t,
				schema: this.schema,
				selection: e || void 0
			});
		}
		Pb(this.schema), this.options.element && this.mount(this.options.element);
	}
	mount(e) {
		if (typeof document > "u") throw Error("[tiptap error]: The editor cannot be mounted because there is no 'document' defined in this environment.");
		this.createView(e), this.emit("mount", { editor: this }), this.css && !document.head.contains(this.css) && document.head.appendChild(this.css), window.setTimeout(() => {
			this.isDestroyed || (this.options.autofocus !== !1 && this.options.autofocus !== null && this.commands.focus(this.options.autofocus), this.emit("create", { editor: this }), this.isInitialized = !0);
		}, 0);
	}
	unmount() {
		if (this.editorView) {
			this.editorState = this.editorView.state;
			let e = this.editorView.dom;
			e?.editor && delete e.editor, this.editorView.destroy();
		}
		if (this.editorView = null, this.isInitialized = !1, this.css && !document.querySelectorAll(`.${this.className}`).length) try {
			typeof this.css.remove == "function" ? this.css.remove() : this.css.parentNode && this.css.parentNode.removeChild(this.css);
		} catch (e) {
			console.warn("Failed to remove CSS element:", e);
		}
		this.css = null, this.emit("unmount", { editor: this });
	}
	get storage() {
		return this.extensionStorage;
	}
	get commands() {
		return this.commandManager.commands;
	}
	chain() {
		return this.commandManager ? this.commandManager.chain() : vg.createFakeChain();
	}
	can() {
		return this.commandManager ? this.commandManager.can() : vg.createFallbackCan();
	}
	injectCSS() {
		this.options.injectCSS && typeof document < "u" && (this.css = Ky(Ib, this.options.injectNonce));
	}
	setOptions(e = {}) {
		this.options = {
			...this.options,
			...e
		}, this.editorView && this.state && !this.isDestroyed && (this.options.editorProps && this.view.setProps({
			...this.options.editorProps,
			attributes: this.getEditorViewAttributes()
		}), this.view.updateState(this.state));
	}
	setEditable(e, t = !0) {
		this.setOptions({ editable: e }), t && this.emit("update", {
			editor: this,
			transaction: this.state.tr,
			appendedTransactions: []
		});
	}
	get isEditable() {
		return this.options.editable && this.view && this.view.editable;
	}
	get view() {
		return this.editorView ? this.editorView : new Proxy({
			state: this.editorState,
			updateState: (e) => {
				this.editorState = e;
			},
			dispatch: (e) => {
				this.dispatchTransaction(e);
			},
			composing: !1,
			dragging: null,
			editable: !0,
			isDestroyed: !1
		}, { get: (e, t) => {
			if (this.editorView) return this.editorView[t];
			if (t === "state") return this.editorState;
			if (t in e) return Reflect.get(e, t);
			throw Error(`[tiptap error]: The editor view is not available. Cannot access view['${t}']. The editor may not be mounted yet.`);
		} });
	}
	get state() {
		return Ty && !this.hasWarnedStaleDecorationRead && Cy(this) && (this.hasWarnedStaleDecorationRead = !0, console.warn("[tiptap warn]: `editor.state` was read while decoration `create()` was running. It returns the pre-transaction document. Use the `state` argument passed to `create()` instead. Helpers like `editor.isActive()` read `editor.state` too, so pass `state` to their standalone versions instead of calling them on the editor.")), this.editorView && (this.editorState = this.view.state), this.editorState;
	}
	registerPlugin(e, t) {
		let n = Q_(t) ? t(e, [...this.state.plugins]) : [...this.state.plugins, e], r = this.state.reconfigure({ plugins: n });
		return this.view.updateState(r), r;
	}
	unregisterPlugin(e) {
		if (this.isDestroyed) return;
		let t = this.state.plugins, n = t;
		if ([].concat(e).forEach((e) => {
			let t = typeof e == "string" ? `${e}$` : e.key;
			n = n.filter((e) => !e.key.startsWith(t));
		}), t.length === n.length) return;
		let r = this.state.reconfigure({ plugins: n });
		return this.view.updateState(r), r;
	}
	createExtensionManager() {
		var e, t;
		let n = [...this.options.enableCoreExtensions ? [
			Tb,
			xb.configure({ blockSeparator: (e = this.options.coreExtensionOptions) == null || (e = e.clipboardTextSerializer) == null ? void 0 : e.blockSeparator }),
			Sb,
			Db,
			kb,
			jb.configure({ value: (t = this.options.coreExtensionOptions) == null || (t = t.tabindex) == null ? void 0 : t.value }),
			wb,
			Ab,
			Cb,
			Mb.configure({ direction: this.options.textDirection })
		].filter((e) => typeof this.options.enableCoreExtensions != "object" || this.options.enableCoreExtensions[e.name] !== !1) : [], ...this.options.extensions].filter((e) => [
			"extension",
			"node",
			"mark"
		].includes(e?.type));
		this.extensionManager = new bb(n, this);
	}
	createCommandManager() {
		this.commandManager = new vg({ editor: this });
	}
	createSchema() {
		this.schema = this.extensionManager.schema;
	}
	createDoc() {
		let e;
		try {
			e = N_(this.options.content, this.schema, this.options.parseOptions, { errorOnInvalidContent: this.options.enableContentCheck });
		} catch (e) {
			if (!(e instanceof Error) || !["[tiptap error]: Invalid JSON content", "[tiptap error]: Invalid HTML content"].includes(e.message)) throw e;
			let t = N_(this.options.content, this.schema, this.options.parseOptions, { errorOnInvalidContent: !1 });
			return this.editorState = mu.create({
				doc: t,
				schema: this.schema,
				selection: Wg(t, this.options.autofocus) || void 0
			}), this.emit("contentError", {
				editor: this,
				error: e,
				disableCollaboration: () => {
					"collaboration" in this.storage && typeof this.storage.collaboration == "object" && this.storage.collaboration && (this.storage.collaboration.isDisabled = !0), this.options.extensions = this.options.extensions.filter((e) => e.name !== "collaboration"), this.createExtensionManager();
				}
			}), this.editorState.doc;
		}
		return e;
	}
	getEditorViewAttributes() {
		let e = this.options.editorProps?.attributes;
		return Q_(e) ? (t) => ({
			role: "textbox",
			...e(t)
		}) : {
			role: "textbox",
			...e
		};
	}
	createView(e) {
		let { editorProps: t, enableExtensionDispatchTransaction: n } = this.options, r = t.dispatchTransaction || this.dispatchTransaction.bind(this), i = n ? this.extensionManager.dispatchTransaction(r) : r, a = t.transformPastedHTML, o = this.extensionManager.transformPastedHTML(a);
		this.editorView = new Sh(e, {
			...t,
			attributes: this.getEditorViewAttributes(),
			dispatchTransaction: i,
			transformPastedHTML: o,
			state: this.editorState,
			markViews: this.extensionManager.markViews,
			nodeViews: this.extensionManager.nodeViews
		});
		let s = this.state.reconfigure({ plugins: this.extensionManager.plugins });
		this.view.updateState(s), this.prependClass(), this.injectCSS();
		let c = this.view.dom;
		c.editor = this;
	}
	createNodeViews() {
		this.view.isDestroyed || this.view.setProps({
			markViews: this.extensionManager.markViews,
			nodeViews: this.extensionManager.nodeViews
		});
	}
	prependClass() {
		this.view.dom.className = `${this.className} ${this.view.dom.className}`;
	}
	captureTransaction(e) {
		this.isCapturingTransaction = !0, e(), this.isCapturingTransaction = !1;
		let t = this.capturedTransaction;
		return this.capturedTransaction = null, t;
	}
	dispatchTransaction(e) {
		if (this.view.isDestroyed) return;
		if (this.isCapturingTransaction) {
			if (!this.capturedTransaction) {
				this.capturedTransaction = e;
				return;
			}
			e.steps.forEach((e) => this.capturedTransaction?.step(e));
			return;
		}
		let { state: t, transactions: n } = this.state.applyTransaction(e), r = !this.state.selection.eq(t.selection), i = n.includes(e), a = this.state;
		if (this.emit("beforeTransaction", {
			editor: this,
			transaction: e,
			nextState: t
		}), !i) return;
		this.view.updateState(t), this.emit("transaction", {
			editor: this,
			transaction: e,
			appendedTransactions: n.slice(1)
		}), r && this.emit("selectionUpdate", {
			editor: this,
			transaction: e
		});
		let o = n.findLast((e) => e.getMeta("focus") || e.getMeta("blur")), s = o?.getMeta("focus"), c = o?.getMeta("blur");
		s && this.emit("focus", {
			editor: this,
			event: s.event,
			transaction: o
		}), c && this.emit("blur", {
			editor: this,
			event: c.event,
			transaction: o
		}), e.getMeta("preventUpdate") || !n.some((e) => e.docChanged) || a.doc.eq(t.doc) || this.emit("update", {
			editor: this,
			transaction: e,
			appendedTransactions: n.slice(1)
		});
	}
	getAttributes(e) {
		return hv(this.state, e);
	}
	isActive(e, t) {
		let n = typeof e == "string" ? e : null, r = typeof e == "string" ? t : e;
		return Ev(this.state, n, r);
	}
	getJSON() {
		return this.state.doc.toJSON();
	}
	getHTML() {
		return V_(this.state.doc.content, this.schema);
	}
	getText(e) {
		let { blockSeparator: t = "\n\n", textSerializers: n = {} } = e || {};
		return fv(this.state.doc, {
			blockSeparator: t,
			textSerializers: {
				...pv(this.schema),
				...n
			}
		});
	}
	get isEmpty() {
		return jv(this.state.doc);
	}
	destroy() {
		this.destroyed || (this.destroyed = !0, this.emit("destroy"), this.unmount(), this.removeAllListeners(), this.extensionManager.destroy(), this.extensionManager = null, this.schema = null, this.commandManager = null, this.extensionStorage = {});
	}
	get isDestroyed() {
		return this.editorView?.isDestroyed ?? !0;
	}
	$node(e, t) {
		return this.$doc?.querySelector(e, t) || null;
	}
	$nodes(e, t) {
		return this.$doc?.querySelectorAll(e, t) || null;
	}
	$pos(e) {
		let t = this.state.doc.resolve(e), n = e > 0 && t.nodeAfter && !t.nodeAfter.isText && t.nodeAfter.isAtom ? t.nodeAfter : null;
		return new Fb(t, this, !1, n);
	}
	get $doc() {
		return this.$pos(0);
	}
};
function Rb(e) {
	return new ab({
		find: e.find,
		handler: ({ state: t, range: n, match: r }) => {
			let i = K(e.getAttributes, void 0, r);
			if (i === !1 || i === null) return null;
			let { tr: a } = t, o = r[r.length - 1], s = r[0];
			if (o) {
				let r = s.search(/\S/), c = n.from + s.indexOf(o), l = c + o.length;
				if (yv(n.from, n.to, t.doc).filter((t) => t.mark.type.excluded.find((n) => n === e.type && n !== t.mark.type)).filter((e) => e.to > c).length) return null;
				l < n.to && a.delete(l, n.to), c > n.from && a.delete(n.from + r, c);
				let u = n.from + r + o.length;
				a.addMark(n.from + r, u, e.type.create(i || {})), a.removeStoredMark(e.type);
			}
		},
		undoable: e.undoable
	});
}
function zb(e) {
	return new ab({
		find: e.find,
		handler: ({ state: t, range: n, match: r }) => {
			let i = K(e.getAttributes, void 0, r) || {}, { tr: a } = t, o = n.from, s = n.to, c = e.type.create(i);
			if (r[1]) {
				let e = o + r[0].lastIndexOf(r[1]);
				if (e > s ? e = s : s = e + r[1].length, n.to - n.from < r[0].length) {
					let e = r[0][r[0].length - 1];
					a.insertText(e, o + r[0].length - 1);
				}
				a.replaceWith(e, s, c);
			} else if (r[0]) {
				let t = e.type.isInline ? o : o - 1;
				a.insert(t, e.type.create(i)).delete(a.mapping.map(o), a.mapping.map(s));
			}
			a.scrollIntoView();
		},
		undoable: e.undoable
	});
}
function Bb(e) {
	return new ab({
		find: e.find,
		handler: ({ state: t, range: n, match: r }) => {
			let i = t.doc.resolve(n.from), a = K(e.getAttributes, void 0, r) || {};
			if (!i.node(-1).canReplaceWith(i.index(-1), i.indexAfter(-1), e.type)) return null;
			t.tr.delete(n.from, n.to).setBlockType(n.from, n.from, e.type, a);
		},
		undoable: e.undoable
	});
}
function Vb(e) {
	return new ab({
		find: e.find,
		handler: ({ state: t, range: n, match: r, chain: i }) => {
			let a = K(e.getAttributes, void 0, r) || {}, o = t.tr.delete(n.from, n.to), s = o.doc.resolve(n.from).blockRange(), c = s && dl(s, e.type, a);
			if (!c) return null;
			if (o.wrap(s, c), e.keepMarks && e.editor) {
				let { selection: n, storedMarks: r } = t, { splittableMarks: i } = e.editor.extensionManager, a = r || n.$to.parentOffset && n.$from.marks();
				if (a) {
					let e = a.filter((e) => i.includes(e.type.name));
					o.ensureMarks(e);
				}
			}
			if (e.keepAttributes) {
				let t = e.type.name === "bulletList" || e.type.name === "orderedList" ? "listItem" : "taskList";
				i().updateAttributes(t, a).run();
			}
			let l = o.doc.resolve(n.from - 1).nodeBefore;
			l && l.type === e.type && Cl(o.doc, n.from - 1) && (!e.joinPredicate || e.joinPredicate(r, l)) && o.join(n.from - 1);
		},
		undoable: e.undoable
	});
}
var Hb = class e extends fb {
	constructor(...e) {
		super(...e), this.type = "node";
	}
	static create(t = {}) {
		let n = typeof t == "function" ? t() : t;
		return new e(n);
	}
	configure(e) {
		return super.configure(e);
	}
	extend(e) {
		let t = typeof e == "function" ? e() : e;
		return super.extend(t);
	}
};
function Ub(e) {
	return new mb({
		find: e.find,
		handler: ({ state: t, range: n, match: r, pasteEvent: i }) => {
			let a = K(e.getAttributes, void 0, r, i);
			if (a === !1 || a === null) return null;
			let { tr: o } = t, s = r[r.length - 1], c = r[0], l = n.to;
			if (s) {
				let i = c.search(/\S/), u = n.from + c.indexOf(s), d = u + s.length;
				if (yv(n.from, n.to, t.doc).filter((t) => t.mark.type.excluded.find((n) => n === e.type && n !== t.mark.type)).filter((e) => e.to > u).length) return null;
				d < n.to && o.delete(d, n.to), u > n.from && o.delete(n.from + i, u), l = n.from + i + s.length, o.addMark(n.from + i, l, e.type.create(a || {})), r.index !== void 0 && r.input !== void 0 && r.index + r[0].length >= r.input.length || o.removeStoredMark(e.type);
			}
		}
	});
}
// node_modules/@tiptap/core/dist/jsx-runtime/jsx-runtime.js
var Wb = /* @__PURE__ */ new WeakSet(), Gb = /* @__PURE__ */ new WeakSet();
function Kb(e) {
	let t = e;
	return Wb.add(t), t;
}
function qb(e) {
	return Array.isArray(e) && Wb.has(e);
}
function Jb(e) {
	return e.flatMap((e) => e == null ? [] : Array.isArray(e) && Gb.has(e) && !qb(e) ? Jb(e) : [e]);
}
function Yb(e, t) {
	if (e === "slot") return 0;
	if (e instanceof Function) {
		let n = e(t);
		return Array.isArray(n) && !qb(n) && !Gb.has(n) ? Kb(n) : n;
	}
	let { children: n, ...r } = t ?? {};
	if (e === "svg") throw Error("SVG elements are not supported in the JSX syntax, use the array syntax instead");
	if (Array.isArray(n)) {
		if (qb(n)) return Kb([
			e,
			r,
			n
		]);
		if (n.length === 0) return Kb([e, r]);
		let t = Jb(n);
		return t.length === 0 ? Kb([e, r]) : Kb([
			e,
			r,
			...t
		]);
	}
	return Kb(n == null ? [e, r] : [
		e,
		r,
		n
	]);
}
var Xb = (e, t) => Yb(e, t), Zb = (e, t) => {
	let { state: n } = e, { selection: r } = n;
	if (!r.empty) return !1;
	let { $from: i } = r;
	if (i.parentOffset !== 0) return !1;
	let a = i.depth - 1;
	if (a < 0) return !1;
	let o = i.node(a), s = i.index(a);
	if (s === 0) return !1;
	if (o.type === t) return e.commands.lift(t.name);
	let c = o.child(s - 1);
	if (c.type !== t || !c.lastChild?.isTextblock) return !1;
	let l = i.before() - 1 - 1;
	return e.commands.command(({ tr: e, dispatch: t }) => {
		if (!t) return !0;
		let n = i.parent.content, r = new P(n, 0, 0);
		return e.replace(l, i.after(), r), e.setSelection(L.create(e.doc, l)), e.scrollIntoView(), t(e), !0;
	});
}, Qb = /^\s*>\s$/, $b = Hb.create({
	name: "blockquote",
	addOptions() {
		return { HTMLAttributes: {} };
	},
	content: "block+",
	group: "block",
	defining: !0,
	parseHTML() {
		return [{ tag: "blockquote" }];
	},
	renderHTML({ HTMLAttributes: e }) {
		return /* @__PURE__ */ Xb("blockquote", {
			...q(this.options.HTMLAttributes, e),
			children: /* @__PURE__ */ Xb("slot", {})
		});
	},
	parseMarkdown: (e, t) => {
		let n = t.parseBlockChildren ?? t.parseChildren;
		return t.createNode("blockquote", void 0, n(e.tokens || []));
	},
	renderMarkdown: (e, t) => {
		if (!e.content) return "";
		let n = [];
		return e.content.forEach((e, r) => {
			let i = (t.renderChild?.call(t, e, r) ?? t.renderChildren([e])).split("\n").map((e) => e.trim() === "" ? ">" : `> ${e}`);
			n.push(i.join("\n"));
		}), n.join("\n>\n");
	},
	addCommands() {
		return {
			setBlockquote: () => ({ commands: e }) => e.wrapIn(this.name),
			toggleBlockquote: () => ({ commands: e }) => e.toggleWrap(this.name),
			unsetBlockquote: () => ({ commands: e }) => e.lift(this.name)
		};
	},
	addKeyboardShortcuts() {
		return {
			"Mod-Shift-b": () => this.editor.commands.toggleBlockquote(),
			Backspace: () => Zb(this.editor, this.type)
		};
	},
	addInputRules() {
		return [Vb({
			find: Qb,
			type: this.type
		})];
	}
}), ex = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))$/, tx = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))/g, nx = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))$/, rx = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))/g, ix = pb.create({
	name: "bold",
	addOptions() {
		return { HTMLAttributes: {} };
	},
	parseHTML() {
		return [
			{ tag: "strong" },
			{
				tag: "b",
				getAttrs: (e) => e.style.fontWeight !== "normal" && null
			},
			{
				style: "font-weight=400",
				clearMark: (e) => e.type.name === this.name
			},
			{
				style: "font-weight",
				getAttrs: (e) => /^(bold(er)?|[5-9]\d{2,})$/.test(e) && null
			}
		];
	},
	renderHTML({ HTMLAttributes: e }) {
		return /* @__PURE__ */ Xb("strong", {
			...q(this.options.HTMLAttributes, e),
			children: /* @__PURE__ */ Xb("slot", {})
		});
	},
	markdownTokenName: "strong",
	parseMarkdown: (e, t) => t.applyMark("bold", t.parseInline(e.tokens || [])),
	markdownOptions: { htmlReopen: {
		open: "<strong>",
		close: "</strong>"
	} },
	renderMarkdown: (e, t) => `**${t.renderChildren(e)}**`,
	addCommands() {
		return {
			setBold: () => ({ commands: e }) => e.setMark(this.name),
			toggleBold: () => ({ commands: e }) => e.toggleMark(this.name),
			unsetBold: () => ({ commands: e }) => e.unsetMark(this.name)
		};
	},
	addKeyboardShortcuts() {
		return {
			"Mod-b": () => this.editor.commands.toggleBold(),
			"Mod-B": () => this.editor.commands.toggleBold()
		};
	},
	addInputRules() {
		return [Rb({
			find: ex,
			type: this.type
		}), Rb({
			find: nx,
			type: this.type
		})];
	},
	addPasteRules() {
		return [Ub({
			find: tx,
			type: this.type
		}), Ub({
			find: rx,
			type: this.type
		})];
	}
}), ax = (e) => {
	let t = /`([^`]+)`(?!`)$/.exec(e);
	return !t || t.index > 0 && e[t.index - 1] === "`" ? null : {
		index: t.index,
		text: t[0],
		replaceWith: t[1]
	};
}, ox = (e) => {
	let t = /`([^`]+)`(?!`)/g, n = [], r;
	for (; (r = t.exec(e)) !== null;) r.index > 0 && e[r.index - 1] === "`" || n.push({
		index: r.index,
		text: r[0],
		replaceWith: r[1]
	});
	return n;
};
function sx(e) {
	let t = new Set((e.match(/`+/g) || []).map((e) => e.length)), n = 1;
	for (; t.has(n);) n += 1;
	return n;
}
var cx = pb.create({
	name: "code",
	addOptions() {
		return { HTMLAttributes: {} };
	},
	excludes: "_",
	code: !0,
	exitable: !0,
	parseHTML() {
		return [{ tag: "code" }];
	},
	renderHTML({ HTMLAttributes: e }) {
		return [
			"code",
			q(this.options.HTMLAttributes, e),
			0
		];
	},
	markdownTokenName: "codespan",
	parseMarkdown: (e, t) => t.applyMark("code", [{
		type: "text",
		text: e.text || ""
	}]),
	renderMarkdown: (e, t, n) => {
		var r;
		if (!e.content) return "";
		let i = typeof (n == null || (r = n.meta) == null ? void 0 : r.markText) == "string" ? n.meta.markText : "", a = "`".repeat(sx(i)), o = i.startsWith("`") || i.endsWith("`") ? " " : "";
		return `${a}${o}${t.renderChildren(e.content)}${o}${a}`;
	},
	addCommands() {
		return {
			setCode: () => ({ commands: e }) => e.setMark(this.name),
			toggleCode: () => ({ commands: e }) => e.toggleMark(this.name),
			unsetCode: () => ({ commands: e }) => e.unsetMark(this.name)
		};
	},
	addKeyboardShortcuts() {
		return { "Mod-e": () => this.editor.commands.toggleCode() };
	},
	addInputRules() {
		return [Rb({
			find: ax,
			type: this.type
		})];
	},
	addPasteRules() {
		return [Ub({
			find: ox,
			type: this.type
		})];
	}
}), lx = 4, ux = /^```([a-z]+)?[\s\n]$/, dx = /^~~~([a-z]+)?[\s\n]$/, fx = Hb.create({
	name: "codeBlock",
	addOptions() {
		return {
			languageClassPrefix: "language-",
			exitOnTripleEnter: !0,
			exitOnArrowDown: !0,
			exitOnArrowUp: !0,
			defaultLanguage: null,
			enableTabIndentation: !1,
			tabSize: lx,
			HTMLAttributes: {}
		};
	},
	content: "text*",
	marks: "",
	group: "block",
	code: !0,
	defining: !0,
	addAttributes() {
		return { language: {
			default: this.options.defaultLanguage,
			parseHTML: (e) => {
				let { languageClassPrefix: t } = this.options;
				return t && [...e.firstElementChild?.classList || []].filter((e) => e.startsWith(t)).map((e) => e.replace(t, ""))[0] || null;
			},
			rendered: !1
		} };
	},
	parseHTML() {
		return [{
			tag: "pre",
			preserveWhitespace: "full"
		}];
	},
	renderHTML({ node: e, HTMLAttributes: t }) {
		return [
			"pre",
			q(this.options.HTMLAttributes, t),
			[
				"code",
				{ class: e.attrs.language ? this.options.languageClassPrefix + e.attrs.language : null },
				0
			]
		];
	},
	markdownTokenName: "code",
	parseMarkdown: (e, t) => e.raw?.startsWith("```") === !1 && e.raw?.startsWith("~~~") === !1 && e.codeBlockStyle !== "indented" ? [] : t.createNode("codeBlock", { language: e.lang || null }, e.text ? [t.createTextNode(e.text)] : []),
	renderMarkdown: (e, t) => {
		let n = "", r = e.attrs?.language || "";
		return n = e.content ? [
			`\`\`\`${r}`,
			t.renderChildren(e.content),
			"```"
		].join("\n") : `\`\`\`${r}\n\n\`\`\``, n;
	},
	addCommands() {
		return {
			setCodeBlock: (e) => ({ commands: t }) => t.setNode(this.name, e),
			toggleCodeBlock: (e) => ({ commands: t }) => t.toggleNode(this.name, "paragraph", e)
		};
	},
	addKeyboardShortcuts() {
		return {
			"Mod-Alt-c": () => this.editor.commands.toggleCodeBlock(),
			Backspace: () => {
				let { empty: e, $anchor: t } = this.editor.state.selection, n = t.pos === 1;
				return !e || t.parent.type.name !== this.name ? !1 : n || !t.parent.textContent.length ? this.editor.commands.clearNodes() : !1;
			},
			Tab: ({ editor: e }) => {
				if (!this.options.enableTabIndentation) return !1;
				let t = this.options.tabSize ?? lx, { state: n } = e, { selection: r } = n, { $from: i, empty: a } = r;
				if (i.parent.type !== this.type) return !1;
				let o = " ".repeat(t);
				return a ? e.commands.insertContent(o) : e.commands.command(({ tr: e }) => {
					let { from: t, to: i } = r, a = n.doc.textBetween(t, i, "\n", "\n").split("\n").map((e) => o + e).join("\n");
					return e.replaceWith(t, i, n.schema.text(a)), !0;
				});
			},
			"Shift-Tab": ({ editor: e }) => {
				if (!this.options.enableTabIndentation) return !1;
				let t = this.options.tabSize ?? lx, { state: n } = e, { selection: r } = n, { $from: i, empty: a } = r;
				return i.parent.type === this.type ? a ? e.commands.command(({ tr: e }) => {
					let { pos: r } = i, a = i.start(), o = i.end(), s = n.doc.textBetween(a, o, "\n", "\n").split("\n"), c = 0, l = 0, u = r - a;
					for (let e = 0; e < s.length; e += 1) {
						if (l + s[e].length >= u) {
							c = e;
							break;
						}
						l += s[e].length + 1;
					}
					let d = s[c].match(/^ */)?.[0] || "", f = Math.min(d.length, t);
					if (f === 0) return !0;
					let p = a;
					for (let e = 0; e < c; e += 1) p += s[e].length + 1;
					return e.delete(p, p + f), r - p <= f && e.setSelection(L.create(e.doc, p)), !0;
				}) : e.commands.command(({ tr: e }) => {
					let { from: i, to: a } = r, o = n.doc.textBetween(i, a, "\n", "\n").split("\n").map((e) => {
						let n = e.match(/^ */)?.[0] || "", r = Math.min(n.length, t);
						return e.slice(r);
					}).join("\n");
					return e.replaceWith(i, a, n.schema.text(o)), !0;
				}) : !1;
			},
			Enter: ({ editor: e }) => {
				if (!this.options.exitOnTripleEnter) return !1;
				let { state: t } = e, { selection: n } = t, { $from: r, empty: i } = n;
				if (!i || r.parent.type !== this.type) return !1;
				let a = r.parentOffset === r.parent.nodeSize - 2, o = r.parent.textContent.endsWith("\n\n");
				return !a || !o ? !1 : e.chain().command(({ tr: e }) => (e.delete(r.pos - 2, r.pos), !0)).exitCode().run();
			},
			ArrowUp: ({ editor: e }) => {
				if (!this.options.exitOnArrowUp) return !1;
				let { state: t } = e, { selection: n } = t, { $from: r, empty: i } = n;
				if (!i || r.parent.type !== this.type || r.parentOffset !== 0) return !1;
				let a = r.before();
				return a > 0 ? !1 : e.commands.insertDefaultBlock({ pos: a });
			},
			ArrowDown: ({ editor: e }) => {
				if (!this.options.exitOnArrowDown) return !1;
				let { state: t } = e, { selection: n, doc: r } = t, { $from: i, empty: a } = n;
				if (!a || i.parent.type !== this.type || i.parentOffset !== i.parent.nodeSize - 2) return !1;
				let o = i.after();
				return o === void 0 ? !1 : r.nodeAt(o) ? e.commands.command(({ tr: e }) => (e.setSelection(I.near(r.resolve(o))), !0)) : e.commands.exitCode();
			}
		};
	},
	addInputRules() {
		return [Bb({
			find: ux,
			type: this.type,
			getAttributes: (e) => ({ language: e[1] })
		}), Bb({
			find: dx,
			type: this.type,
			getAttributes: (e) => ({ language: e[1] })
		})];
	},
	addProseMirrorPlugins() {
		return [new z({
			key: new B("codeBlockVSCodeHandler"),
			props: { handlePaste: (e, t) => {
				if (!t.clipboardData || this.editor.isActive(this.type.name)) return !1;
				let n = t.clipboardData.getData("text/plain"), r = t.clipboardData.getData("vscode-editor-data"), i = (r ? JSON.parse(r) : void 0)?.mode;
				if (!n || !i) return !1;
				let { tr: a, schema: o } = e.state, s = o.text(n.replace(/\r\n?/g, "\n"));
				return a.replaceSelectionWith(this.type.create({ language: i }, s)), a.selection.$from.parent.type !== this.type && a.setSelection(L.near(a.doc.resolve(Math.max(0, a.selection.from - 2)))), a.setMeta("paste", !0), e.dispatch(a), !0;
			} }
		})];
	}
}), px = Hb.create({
	name: "doc",
	topNode: !0,
	content: "block+",
	renderMarkdown: (e, t) => e.content ? t.renderChildren(e.content, "\n\n") : ""
}), mx = Hb.create({
	name: "hardBreak",
	markdownTokenName: "br",
	addOptions() {
		return {
			keepMarks: !0,
			HTMLAttributes: {}
		};
	},
	inline: !0,
	group: "inline",
	selectable: !1,
	linebreakReplacement: !0,
	parseHTML() {
		return [{ tag: "br" }];
	},
	renderHTML({ HTMLAttributes: e }) {
		return ["br", q(this.options.HTMLAttributes, e)];
	},
	renderText() {
		return "\n";
	},
	renderMarkdown: () => "  \n",
	parseMarkdown: () => ({ type: "hardBreak" }),
	addCommands() {
		return { setHardBreak: () => ({ commands: e, chain: t, state: n, editor: r }) => e.first([() => e.exitCode(), () => e.command(() => {
			let { selection: e, storedMarks: i } = n;
			if (e.$from.parent.type.spec.isolating) return !1;
			let { keepMarks: a } = this.options, { splittableMarks: o } = r.extensionManager, s = i || e.$to.parentOffset && e.$from.marks();
			return t().insertContent({ type: this.name }).command(({ tr: e, dispatch: t }) => {
				if (t && s && a) {
					let t = s.filter((e) => o.includes(e.type.name));
					e.ensureMarks(t);
				}
				return !0;
			}).scrollIntoView().run();
		})]) };
	},
	addKeyboardShortcuts() {
		return {
			"Mod-Enter": () => this.editor.commands.setHardBreak(),
			"Shift-Enter": () => this.editor.commands.setHardBreak()
		};
	}
}), hx = Hb.create({
	name: "heading",
	addOptions() {
		return {
			levels: [
				1,
				2,
				3,
				4,
				5,
				6
			],
			HTMLAttributes: {}
		};
	},
	content: "inline*",
	group: "block",
	defining: !0,
	addAttributes() {
		return { level: {
			default: 1,
			rendered: !1
		} };
	},
	parseHTML() {
		return this.options.levels.map((e) => ({
			tag: `h${e}`,
			attrs: { level: e }
		}));
	},
	renderHTML({ node: e, HTMLAttributes: t }) {
		return [
			`h${this.options.levels.includes(e.attrs.level) ? e.attrs.level : this.options.levels[0]}`,
			q(this.options.HTMLAttributes, t),
			0
		];
	},
	parseMarkdown(e, t) {
		let n = e.depth || 1;
		return this.options.levels.includes(n) ? t.createNode("heading", { level: n }, t.parseInline(e.tokens || [])) : t.createNode("paragraph", void 0, t.parseInline(e.tokens || []));
	},
	renderMarkdown: (e, t) => {
		let n = e.attrs?.level ? parseInt(e.attrs.level, 10) : 1, r = "#".repeat(n);
		return e.content ? `${r} ${t.renderChildren(e.content)}` : "";
	},
	addCommands() {
		return {
			setHeading: (e) => ({ commands: t }) => this.options.levels.includes(e.level) ? t.setNode(this.name, e) : !1,
			toggleHeading: (e) => ({ commands: t }) => this.options.levels.includes(e.level) ? t.toggleNode(this.name, "paragraph", e) : !1
		};
	},
	addKeyboardShortcuts() {
		return this.options.levels.reduce((e, t) => ({
			...e,
			[`Mod-Alt-${t}`]: () => this.editor.commands.toggleHeading({ level: t })
		}), {});
	},
	addInputRules() {
		return this.options.levels.map((e) => Bb({
			find: RegExp(`^(#{${Math.min(...this.options.levels)},${e}})\\s$`),
			type: this.type,
			getAttributes: { level: e }
		}));
	}
}), gx = Hb.create({
	name: "horizontalRule",
	addOptions() {
		return {
			HTMLAttributes: {},
			nextNodeType: "paragraph"
		};
	},
	group: "block",
	parseHTML() {
		return [{ tag: "hr" }];
	},
	renderHTML({ HTMLAttributes: e }) {
		return ["hr", q(this.options.HTMLAttributes, e)];
	},
	markdownTokenName: "hr",
	parseMarkdown: (e, t) => t.createNode("horizontalRule"),
	renderMarkdown: () => "---",
	addCommands() {
		return { setHorizontalRule: () => ({ chain: e, state: t }) => {
			if (!Gy(t, t.schema.nodes[this.name])) return !1;
			let { selection: n } = t, { $to: r } = n, i = e();
			return Mv(n) ? i.insertContentAt(r.pos, { type: this.name }) : i.insertContent({ type: this.name }), i.command(({ state: e, tr: t, dispatch: n }) => {
				if (n) {
					let { $to: n } = t.selection, r = n.end();
					if (n.nodeAfter) n.nodeAfter.isTextblock ? t.setSelection(L.create(t.doc, n.pos + 1)) : n.nodeAfter.isBlock ? t.setSelection(R.create(t.doc, n.pos)) : t.setSelection(L.create(t.doc, n.pos));
					else {
						let i = (e.schema.nodes[this.options.nextNodeType] || n.parent.type.contentMatch.defaultType)?.create();
						i && (t.insert(r, i), t.setSelection(L.create(t.doc, r + 1)));
					}
					t.scrollIntoView();
				}
				return !0;
			}).run();
		} };
	},
	addInputRules() {
		return [zb({
			find: /^(?:---|—-|___\s|\*\*\*\s)$/,
			type: this.type
		})];
	}
}), _x = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))$/, vx = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))/g, yx = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))$/, bx = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))/g, xx = pb.create({
	name: "italic",
	addOptions() {
		return { HTMLAttributes: {} };
	},
	parseHTML() {
		return [
			{ tag: "em" },
			{
				tag: "i",
				getAttrs: (e) => e.style.fontStyle !== "normal" && null
			},
			{
				style: "font-style=normal",
				clearMark: (e) => e.type.name === this.name
			},
			{ style: "font-style=italic" }
		];
	},
	renderHTML({ HTMLAttributes: e }) {
		return [
			"em",
			q(this.options.HTMLAttributes, e),
			0
		];
	},
	addCommands() {
		return {
			setItalic: () => ({ commands: e }) => e.setMark(this.name),
			toggleItalic: () => ({ commands: e }) => e.toggleMark(this.name),
			unsetItalic: () => ({ commands: e }) => e.unsetMark(this.name)
		};
	},
	markdownTokenName: "em",
	parseMarkdown: (e, t) => t.applyMark("italic", t.parseInline(e.tokens || [])),
	markdownOptions: { htmlReopen: {
		open: "<em>",
		close: "</em>"
	} },
	renderMarkdown: (e, t) => `*${t.renderChildren(e)}*`,
	addKeyboardShortcuts() {
		return {
			"Mod-i": () => this.editor.commands.toggleItalic(),
			"Mod-I": () => this.editor.commands.toggleItalic()
		};
	},
	addInputRules() {
		return [Rb({
			find: _x,
			type: this.type
		}), Rb({
			find: yx,
			type: this.type
		})];
	},
	addPasteRules() {
		return [Ub({
			find: vx,
			type: this.type
		}), Ub({
			find: bx,
			type: this.type
		})];
	}
}), Sx = "aaa1rp3bb0ott3vie4c1le2ogado5udhabi7c0ademy5centure6ountant0s9o1tor4d0s1ult4e0g1ro2tna4f0l1rica5g0akhan5ency5i0g1rbus3force5tel5kdn3l0ibaba4pay4lfinanz6state5y2sace3tom5m0azon4ericanexpress7family11x2fam3ica3sterdam8nalytics7droid5quan4z2o0l2partments8p0le4q0uarelle8r0ab1mco4chi3my2pa2t0e3s0da2ia2sociates9t0hleta5torney7u0ction5di0ble3o3spost5thor3o0s4w0s2x0a2z0ure5ba0by2idu3namex4d1k2r0celona5laycard4s5efoot5gains6seball5ketball8uhaus5yern5b0c1t1va3cg1n2d1e0ats2uty4er2rlin4st0buy5t2f1g1h0arti5i0ble3d1ke2ng0o3o1z2j1lack0friday9ockbuster8g1omberg7ue3m0s1w2n0pparibas9o0ats3ehringer8fa2m1nd2o0k0ing5sch2tik2on4t1utique6x2r0adesco6idgestone9oadway5ker3ther5ussels7s1t1uild0ers6siness6y1zz3v1w1y1z0h3ca0b1fe2l0l1vinklein9m0era3p2non3petown5ital0one8r0avan4ds2e0er0s4s2sa1e1h1ino4t0ering5holic7ba1n1re3c1d1enter4o1rn3f0a1d2g1h0anel2nel4rity4se2t2eap3intai5ristmas6ome4urch5i0priani6rcle4sco3tadel4i0c2y3k1l0aims4eaning6ick2nic1que6othing5ud3ub0med6m1n1o0ach3des3ffee4llege4ogne5m0mbank4unity6pany2re3uter5sec4ndos3struction8ulting7tact3ractors9oking4l1p2rsica5untry4pon0s4rses6pa2r0edit0card4union9icket5own3s1uise0s6u0isinella9v1w1x1y0mru3ou3z2dad1nce3ta1e1ing3sun4y2clk3ds2e0al0er2s3gree4livery5l1oitte5ta3mocrat6ntal2ist5si0gn4v2hl2iamonds6et2gital5rect0ory7scount3ver5h2y2j1k1m1np2o0cs1tor4g1mains5t1wnload7rive4tv2ubai3pont4rban5vag2r2z2earth3t2c0o2deka3u0cation8e1g1mail3erck5nergy4gineer0ing9terprises10pson4quipment8r0icsson6ni3s0q1tate5t1u0rovision8s2vents5xchange6pert3osed4ress5traspace10fage2il1rwinds6th3mily4n0s2rm0ers5shion4t3edex3edback6rrari3ero6i0delity5o2lm2nal1nce1ial7re0stone6mdale6sh0ing5t0ness6j1k1lickr3ghts4r2orist4wers5y2m1o0o0d1tball6rd1ex2sale4um3undation8x2r0ee1senius7l1ogans4ntier7tr2ujitsu5n0d2rniture7tbol5yi3ga0l0lery3o1up4me0s3p1rden4y2b0iz3d0n2e0a1nt0ing5orge5f1g0ee3h1i0ft0s3ves2ing5l0ass3e1obal2o4m0ail3bh2o1x2n1odaddy5ld0point6f2odyear5g0le4p1t1v2p1q1r0ainger5phics5tis4een3ipe3ocery4up4s1t1u0cci3ge2ide2tars5ru3w1y2hair2mburg5ngout5us3bo2dfc0bank7ealth0care8lp1sinki6re1mes5iphop4samitsu7tachi5v2k0t2m1n1ockey4ldings5iday5medepot5goods5s0ense7nda3rse3spital5t0ing5t0els3mail5use3w2r1sbc3t1u0ghes5yatt3undai7ibm2cbc2e1u2d1e0ee3fm2kano4l1m0amat4db2mo0bilien9n0c1dustries8finiti5o2g1k1stitute6urance4e4t0ernational10uit4vestments10o1piranga7q1r0ish4s0maili5t0anbul7t0au2v3jaguar4va3cb2e0ep2tzt3welry6io2ll2m0p2nj2o0bs1urg4t1y2p0morgan6rs3uegos6kaufen5ddi3e0rryhotels6properties14fh2g1h1i0a1ds2m1ndle4tchen5wi3m1n1oeln3matsu5sher5p0mg2n2r0d1ed3uokgroup8w1y0oto4z2la0caixa5mborghini8er3nd0rover6xess5salle5t0ino3robe5w0yer5b1c1ds2ease3clerc5frak4gal2o2xus4gbt3i0dl2fe0insurance9style7ghting6ke2lly3mited4o2ncoln4k2ve1ing5k1lc1p2oan0s3cker3us3l1ndon4tte1o3ve3pl0financial11r1s1t0d0a3u0ndbeck6xe1ury5v1y2ma0drid4if1son4keup4n0agement7go3p1rket0ing3s4riott5shalls7ttel5ba2c0kinsey7d1e0d0ia3et2lbourne7me1orial6n0u2rck0msd7g1h1iami3crosoft7l1ni1t2t0subishi9k1l0b1s2m0a2n1o0bi0le4da2e1i1m1nash3ey2ster5rmon3tgage6scow4to0rcycles9v0ie4p1q1r1s0d2t0n1r2u0seum3ic4v1w1x1y1z2na0b1goya4me2vy3ba2c1e0c1t0bank4flix4work5ustar5w0s2xt0direct7us4f0l2g0o2hk2i0co2ke1on3nja3ssan1y5l1o0kia3rton4w0ruz3tv4p1r0a1w2tt2u1yc2z2obi1server7ffice5kinawa6layan0group9lo3m0ega4ne1g1l0ine5oo2pen3racle3nge4g0anic5igins6saka4tsuka4t2vh3pa0ge2nasonic7ris2s1tners4s1y3y2ccw3e0t2f0izer5g1h0armacy6d1ilips5one2to0graphy6s4ysio5ics1tet2ures6d1n0g1k2oneer5zza4k1l0ace2y0station9umbing5s3m1n0c2ohl2ker3litie5rn2st3r0axi3ess3ime3o0d0uctions8f1gressive8mo2perties3y5tection8u0dential9s1t1ub2w0c2y2qa1pon3uebec3st5racing4dio4e0ad1lestate6tor2y4cipes5d0umbrella9hab3ise0n3t2liance6n0t0als5pair3ort3ublican8st0aurant8view0s5xroth6ich0ardli6oh3l1o1p2o0cks3deo3gers4om3s0vp3u0gby3hr2n2w0e2yukyu6sa0arland6fe0ty4kura4le1on3msclub4ung5ndvik0coromant12ofi4p1rl2s1ve2xo3b0i1s2c0b1haeffler7midt4olarships8ol3ule3warz5ience5ot3d1e0arch3t2cure1ity6ek2lect4ner3rvices6ven3w1x0y3fr2g1h0angrila6rp3ell3ia1ksha5oes2p0ping5uji3w3i0lk2na1gles5te3j1k0i0n2y0pe4l0ing4m0art3ile4n0cf3o0ccer3ial4ftbank4ware6hu2lar2utions7ng1y2y2pa0ce3ort2t3r0l2s1t0ada2ples4r1tebank4farm7c0group6ockholm6rage3e3ream4udio2y3yle4u0cks3pplies3y2ort5rf1gery5zuki5v1watch4iss4x1y0dney4stems6z2tab1ipei4lk2obao4rget4tamotors6r2too4x0i3c0i2d0k2eam2ch0nology8l1masek5nnis4va3f1g1h0d1eater2re6iaa2ckets5enda4ps2res2ol4j0maxx4x2k0maxx5l1m0all4n1o0day3kyo3ols3p1ray3shiba5tal3urs3wn2yota3s3r0ade1ing4ining5vel0ers0insurance16ust3v2t1ube2i1nes3shu4v0s2w1z2ua1bank3s2g1k1nicom3versity8o2ol2ps2s1y1z2va0cations7na1guard7c1e0gas3ntures6risign5mögensberater2ung14sicherung10t2g1i0ajes4deo3g1king4llas4n1p1rgin4sa1ion4va1o3laanderen9n1odka3lvo3te1ing3o2yage5u2wales2mart4ter4ng0gou5tch0es6eather0channel12b0cam3er2site5d0ding5ibo2r3f1hoswho6ien2ki2lliamhill9n0dows4e1ners6me2oodside6rk0s2ld3w2s1tc1f3xbox3erox4ihuan4n2xx2yz3yachts4hoo3maxun5ndex5e1odobashi7ga2kohama6u0tube6t1un3za0ppos4ra3ero3ip2m1one3uerich6w2", Cx = "ελ1υ2бг1ел3дети4ею2католик6ом3мкд2он1сква6онлайн5рг3рус2ф2сайт3рб3укр3қаз3հայ3ישראל5קום3ابوظبي5رامكو5لاردن4بحرين5جزائر5سعودية6عليان5مغرب5مارات5یران5بارت2زار4يتك3ھارت5تونس4سودان3رية5شبكة4عراق2ب2مان4فلسطين6قطر3كاثوليك6وم3مصر2ليسيا5وريتانيا7قع4همراه5پاکستان7ڀارت4कॉम3नेट3भारत0म्3ोत5संगठन5বাংলা5ভারত2ৰত4ਭਾਰਤ4ભારત4ଭାରତ4இந்தியா6லங்கை6சிங்கப்பூர்11భారత్5ಭಾರತ4ഭാരതം5ලංකා4คอม3ไทย3ລາວ3გე2みんな3アマゾン4クラウド4グーグル4コム2ストア3セール3ファッション6ポイント4世界2中信1国1國1文网3亚马逊3企业2佛山2信息2健康2八卦2公司1益2台湾1灣2商城1店1标2嘉里0大酒店5在线2大拿2天主教3娱乐2家電2广东2微博2慈善2我爱你3手机2招聘2政务1府2新加坡2闻2时尚2書籍2机构2淡马锡3游戏2澳門2点看2移动2组织机构4网址1店1站1络2联通2谷歌2购物2通販2集团2電訊盈科4飞利浦3食品2餐厅2香格里拉3港2닷넷1컴2삼성2한국2", wx = "numeric", Tx = "ascii", Ex = "alpha", Dx = "asciinumeric", Ox = "alphanumeric", kx = "domain", Ax = "emoji", jx = "scheme", Mx = "slashscheme", Nx = "whitespace";
function Px(e, t) {
	return e in t || (t[e] = []), t[e];
}
function Fx(e, t, n) {
	t[wx] && (t[Dx] = !0, t[Ox] = !0), t[Tx] && (t[Dx] = !0, t[Ex] = !0), t[Dx] && (t[Ox] = !0), t[Ex] && (t[Ox] = !0), t[Ox] && (t[kx] = !0), t[Ax] && (t[kx] = !0);
	for (let r in t) {
		let t = Px(r, n);
		t.indexOf(e) < 0 && t.push(e);
	}
}
function Ix(e, t) {
	let n = {};
	for (let r in t) t[r].indexOf(e) >= 0 && (n[r] = !0);
	return n;
}
function Lx(e = null) {
	this.j = {}, this.jr = [], this.jd = null, this.t = e;
}
Lx.groups = {}, Lx.prototype = {
	accepts() {
		return !!this.t;
	},
	go(e) {
		let t = this, n = t.j[e];
		if (n) return n;
		for (let n = 0; n < t.jr.length; n++) {
			let r = t.jr[n][0], i = t.jr[n][1];
			if (i && r.test(e)) return i;
		}
		return t.jd;
	},
	has(e, t = !1) {
		return t ? e in this.j : !!this.go(e);
	},
	ta(e, t, n, r) {
		for (let i = 0; i < e.length; i++) this.tt(e[i], t, n, r);
	},
	tr(e, t, n, r) {
		r ||= Lx.groups;
		let i;
		return t && t.j ? i = t : (i = new Lx(t), n && r && Fx(t, n, r)), this.jr.push([e, i]), i;
	},
	ts(e, t, n, r) {
		let i = this, a = e.length;
		if (!a) return i;
		for (let t = 0; t < a - 1; t++) i = i.tt(e[t]);
		return i.tt(e[a - 1], t, n, r);
	},
	tt(e, t, n, r) {
		r ||= Lx.groups;
		let i = this;
		if (t && t.j) return i.j[e] = t, t;
		let a = t, o, s = i.go(e);
		return s ? (o = new Lx(), Object.assign(o.j, s.j), o.jr.push.apply(o.jr, s.jr), o.jd = s.jd, o.t = s.t) : o = new Lx(), a && (r && (o.t && typeof o.t == "string" ? Fx(a, Object.assign(Ix(o.t, r), n), r) : n && Fx(a, n, r)), o.t = a), i.j[e] = o, o;
	}
};
var Y = (e, t, n, r, i) => e.ta(t, n, r, i), X = (e, t, n, r, i) => e.tr(t, n, r, i), Rx = (e, t, n, r, i) => e.ts(t, n, r, i), Z = (e, t, n, r, i) => e.tt(t, n, r, i), zx = "WORD", Bx = "UWORD", Vx = "ASCIINUMERICAL", Hx = "ALPHANUMERICAL", Ux = "LOCALHOST", Wx = "TLD", Gx = "UTLD", Kx = "SCHEME", qx = "SLASH_SCHEME", Jx = "NUM", Yx = "WS", Xx = "NL", Zx = "OPENBRACE", Qx = "CLOSEBRACE", $x = "OPENBRACKET", eS = "CLOSEBRACKET", tS = "OPENPAREN", nS = "CLOSEPAREN", rS = "OPENANGLEBRACKET", iS = "CLOSEANGLEBRACKET", aS = "FULLWIDTHLEFTPAREN", oS = "FULLWIDTHRIGHTPAREN", sS = "LEFTCORNERBRACKET", cS = "RIGHTCORNERBRACKET", lS = "LEFTWHITECORNERBRACKET", uS = "RIGHTWHITECORNERBRACKET", dS = "FULLWIDTHLESSTHAN", fS = "FULLWIDTHGREATERTHAN", pS = "AMPERSAND", mS = "APOSTROPHE", hS = "ASTERISK", gS = "AT", _S = "BACKSLASH", vS = "BACKTICK", yS = "CARET", bS = "COLON", xS = "COMMA", SS = "DOLLAR", CS = "DOT", wS = "EQUALS", TS = "EXCLAMATION", ES = "HYPHEN", DS = "PERCENT", OS = "PIPE", kS = "PLUS", AS = "POUND", jS = "QUERY", MS = "QUOTE", NS = "FULLWIDTHMIDDLEDOT", PS = "SEMI", FS = "SLASH", IS = "TILDE", LS = "UNDERSCORE", RS = "EMOJI", zS = "SYM", BS = /*#__PURE__*/ Object.freeze({
	__proto__: null,
	ALPHANUMERICAL: Hx,
	AMPERSAND: pS,
	APOSTROPHE: mS,
	ASCIINUMERICAL: Vx,
	ASTERISK: hS,
	AT: gS,
	BACKSLASH: _S,
	BACKTICK: vS,
	CARET: yS,
	CLOSEANGLEBRACKET: iS,
	CLOSEBRACE: Qx,
	CLOSEBRACKET: eS,
	CLOSEPAREN: nS,
	COLON: bS,
	COMMA: xS,
	DOLLAR: SS,
	DOT: CS,
	EMOJI: RS,
	EQUALS: wS,
	EXCLAMATION: TS,
	FULLWIDTHGREATERTHAN: fS,
	FULLWIDTHLEFTPAREN: aS,
	FULLWIDTHLESSTHAN: dS,
	FULLWIDTHMIDDLEDOT: NS,
	FULLWIDTHRIGHTPAREN: oS,
	HYPHEN: ES,
	LEFTCORNERBRACKET: sS,
	LEFTWHITECORNERBRACKET: lS,
	LOCALHOST: Ux,
	NL: Xx,
	NUM: Jx,
	OPENANGLEBRACKET: rS,
	OPENBRACE: Zx,
	OPENBRACKET: $x,
	OPENPAREN: tS,
	PERCENT: DS,
	PIPE: OS,
	PLUS: kS,
	POUND: AS,
	QUERY: jS,
	QUOTE: MS,
	RIGHTCORNERBRACKET: cS,
	RIGHTWHITECORNERBRACKET: uS,
	SCHEME: Kx,
	SEMI: PS,
	SLASH: FS,
	SLASH_SCHEME: qx,
	SYM: zS,
	TILDE: IS,
	TLD: Wx,
	UNDERSCORE: LS,
	UTLD: Gx,
	UWORD: Bx,
	WORD: zx,
	WS: Yx
}), VS = /[a-z]/, HS = /[a-z]/i, US = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]|\u{FE0F}/u;
try {
	HS = /* @__PURE__ */ RegExp("\\p{L}", "u"), US = /* @__PURE__ */ RegExp("\\p{Emoji}", "u");
} catch {}
var WS = /\d/, GS = /\s/, KS = "\r", qS = "\n", JS = "️", YS = "‍", XS = "￼", ZS = null, QS = null;
function $S(e = []) {
	let t = {};
	Lx.groups = t;
	let n = new Lx();
	ZS ??= rC(Sx), QS ??= rC(Cx), Z(n, "'", mS), Z(n, "{", Zx), Z(n, "}", Qx), Z(n, "[", $x), Z(n, "]", eS), Z(n, "(", tS), Z(n, ")", nS), Z(n, "<", rS), Z(n, ">", iS), Z(n, "（", aS), Z(n, "）", oS), Z(n, "「", sS), Z(n, "」", cS), Z(n, "『", lS), Z(n, "』", uS), Z(n, "＜", dS), Z(n, "＞", fS), Z(n, "&", pS), Z(n, "*", hS), Z(n, "@", gS), Z(n, "`", vS), Z(n, "^", yS), Z(n, ":", bS), Z(n, ",", xS), Z(n, "$", SS), Z(n, ".", CS), Z(n, "=", wS), Z(n, "!", TS), Z(n, "-", ES), Z(n, "%", DS), Z(n, "|", OS), Z(n, "+", kS), Z(n, "#", AS), Z(n, "?", jS), Z(n, "\"", MS), Z(n, "/", FS), Z(n, ";", PS), Z(n, "~", IS), Z(n, "_", LS), Z(n, "\\", _S), Z(n, "・", NS);
	let r = X(n, WS, Jx, { [wx]: !0 });
	X(r, WS, r);
	let i = X(r, VS, Vx, { [Dx]: !0 }), a = X(r, HS, Hx, { [Ox]: !0 }), o = X(n, VS, zx, { [Tx]: !0 });
	X(o, WS, i), X(o, VS, o), X(i, WS, i), X(i, VS, i);
	let s = X(n, HS, Bx, { [Ex]: !0 });
	X(s, VS), X(s, WS, a), X(s, HS, s), X(a, WS, a), X(a, VS), X(a, HS, a);
	let c = Z(n, qS, Xx, { [Nx]: !0 }), l = Z(n, KS, Yx, { [Nx]: !0 }), u = X(n, GS, Yx, { [Nx]: !0 });
	Z(n, XS, u), Z(l, qS, c), Z(l, XS, u), X(l, GS, u), Z(u, KS), Z(u, qS), X(u, GS, u), Z(u, XS, u);
	let d = X(n, US, RS, { [Ax]: !0 });
	Z(d, "#"), X(d, US, d), Z(d, JS, d);
	let f = Z(d, YS);
	Z(f, "#"), X(f, US, d);
	let p = [[VS, o], [WS, i]], m = [
		[VS, null],
		[HS, s],
		[WS, a]
	];
	for (let e = 0; e < ZS.length; e++) nC(n, ZS[e], Wx, zx, p);
	for (let e = 0; e < QS.length; e++) nC(n, QS[e], Gx, Bx, m);
	Fx(Wx, {
		tld: !0,
		ascii: !0
	}, t), Fx(Gx, {
		utld: !0,
		alpha: !0
	}, t), nC(n, "file", Kx, zx, p), nC(n, "mailto", Kx, zx, p), nC(n, "http", qx, zx, p), nC(n, "https", qx, zx, p), nC(n, "ftp", qx, zx, p), nC(n, "ftps", qx, zx, p), Fx(Kx, {
		scheme: !0,
		ascii: !0
	}, t), Fx(qx, {
		slashscheme: !0,
		ascii: !0
	}, t), e = e.sort((e, t) => e[0] > t[0] ? 1 : -1);
	for (let t = 0; t < e.length; t++) {
		let r = e[t][0], i = e[t][1] ? { [jx]: !0 } : { [Mx]: !0 };
		r.indexOf("-") >= 0 ? i[kx] = !0 : VS.test(r) ? WS.test(r) ? i[Dx] = !0 : i[Tx] = !0 : i[wx] = !0, Rx(n, r, r, i);
	}
	return Rx(n, "localhost", Ux, { ascii: !0 }), n.jd = new Lx(zS), {
		start: n,
		tokens: Object.assign({ groups: t }, BS)
	};
}
function eC(e, t) {
	let n = tC(t.replace(/[A-Z]/g, (e) => e.toLowerCase())), r = n.length, i = [], a = 0, o = 0;
	for (; o < r;) {
		let s = e, c = null, l = 0, u = null, d = -1, f = -1;
		for (; o < r && (c = s.go(n[o]));) s = c, s.accepts() ? (d = 0, f = 0, u = s) : d >= 0 && (d += n[o].length, f++), l += n[o].length, a += n[o].length, o++;
		a -= d, o -= f, l -= d, i.push({
			t: u.t,
			v: t.slice(a - l, a),
			s: a - l,
			e: a
		});
	}
	return i;
}
function tC(e) {
	let t = [], n = e.length, r = 0;
	for (; r < n;) {
		let i = e.charCodeAt(r), a, o = i < 55296 || i > 56319 || r + 1 === n || (a = e.charCodeAt(r + 1)) < 56320 || a > 57343 ? e[r] : e.slice(r, r + 2);
		t.push(o), r += o.length;
	}
	return t;
}
function nC(e, t, n, r, i) {
	let a, o = t.length;
	for (let n = 0; n < o - 1; n++) {
		let o = t[n];
		e.j[o] ? a = e.j[o] : (a = new Lx(r), a.jr = i.slice(), e.j[o] = a), e = a;
	}
	return a = new Lx(n), a.jr = i.slice(), e.j[t[o - 1]] = a, a;
}
function rC(e) {
	let t = [], n = [], r = 0;
	for (; r < e.length;) {
		let i = 0;
		for (; "0123456789".indexOf(e[r + i]) >= 0;) i++;
		if (i > 0) {
			t.push(n.join(""));
			for (let t = parseInt(e.substring(r, r + i), 10); t > 0; t--) n.pop();
			r += i;
		} else n.push(e[r]), r++;
	}
	return t;
}
var iC = {
	defaultProtocol: "http",
	events: null,
	format: oC,
	formatHref: oC,
	nl2br: !1,
	tagName: "a",
	target: null,
	rel: null,
	validate: !0,
	truncate: Infinity,
	className: null,
	attributes: null,
	ignoreTags: [],
	ignoreClasses: [],
	render: null
};
function aC(e, t = null) {
	let n = Object.assign({}, iC);
	e && (n = Object.assign(n, e instanceof aC ? e.o : e));
	let r = n.ignoreTags, i = [];
	for (let e = 0; e < r.length; e++) i.push(r[e].toUpperCase());
	this.o = n, t && (this.defaultRender = t), this.ignoreTags = i, this.ignoreClasses = n.ignoreClasses.slice();
}
aC.prototype = {
	o: iC,
	ignoreTags: [],
	ignoreClasses: [],
	isIgnoredClass(e) {
		if (typeof e != "string" || this.ignoreClasses.length === 0) return !1;
		let t = e.split(/\s+/);
		for (let e = 0; e < t.length; e++) if (this.ignoreClasses.indexOf(t[e]) >= 0) return !0;
		return !1;
	},
	defaultRender(e) {
		return e;
	},
	check(e) {
		return this.get("validate", e.toString(), e);
	},
	get(e, t, n) {
		let r = t != null, i = this.o[e];
		return i && (typeof i == "object" ? (i = n.t in i ? i[n.t] : iC[e], typeof i == "function" && r && (i = i(t, n))) : typeof i == "function" && r && (i = i(t, n.t, n)), i);
	},
	getObj(e, t, n) {
		let r = this.o[e];
		return typeof r == "function" && t != null && (r = r(t, n.t, n)), r;
	},
	render(e) {
		let t = e.render(this);
		return (this.get("render", null, e) || this.defaultRender)(t, e.t, e);
	}
};
function oC(e) {
	return e;
}
function sC(e, t) {
	this.t = "token", this.v = e, this.tk = t;
}
sC.prototype = {
	isLink: !1,
	toString() {
		return this.v;
	},
	toHref(e) {
		return this.toString();
	},
	toFormattedString(e) {
		let t = this.toString(), n = e.get("truncate", t, this), r = e.get("format", t, this);
		return n && r.length > n ? r.substring(0, n) + "…" : r;
	},
	toFormattedHref(e) {
		return e.get("formatHref", this.toHref(e.get("defaultProtocol")), this);
	},
	startIndex() {
		return this.tk[0].s;
	},
	endIndex() {
		return this.tk[this.tk.length - 1].e;
	},
	toObject(e = iC.defaultProtocol) {
		return {
			type: this.t,
			value: this.toString(),
			isLink: this.isLink,
			href: this.toHref(e),
			start: this.startIndex(),
			end: this.endIndex()
		};
	},
	toFormattedObject(e) {
		return {
			type: this.t,
			value: this.toFormattedString(e),
			isLink: this.isLink,
			href: this.toFormattedHref(e),
			start: this.startIndex(),
			end: this.endIndex()
		};
	},
	validate(e) {
		return e.get("validate", this.toString(), this);
	},
	render(e) {
		let t = this, n = this.toHref(e.get("defaultProtocol")), r = e.get("formatHref", n, this), i = e.get("tagName", n, t), a = this.toFormattedString(e), o = {}, s = e.get("className", n, t), c = e.get("target", n, t), l = e.get("rel", n, t), u = e.getObj("attributes", n, t), d = e.getObj("events", n, t);
		return o.href = r, s && (o.class = s), c && (o.target = c), l && (o.rel = l), u && Object.assign(o, u), {
			tagName: i,
			attributes: o,
			content: a,
			eventListeners: d
		};
	}
};
function cC(e, t) {
	class n extends sC {
		constructor(t, n) {
			super(t, n), this.t = e;
		}
	}
	for (let e in t) n.prototype[e] = t[e];
	return n.t = e, n;
}
var lC = cC("email", {
	isLink: !0,
	toHref() {
		return "mailto:" + this.toString();
	}
}), uC = cC("text"), dC = cC("nl"), fC = cC("url", {
	isLink: !0,
	toHref(e = iC.defaultProtocol) {
		return this.hasProtocol() ? this.v : `${e}://${this.v}`;
	},
	hasProtocol() {
		let e = this.tk;
		return e.length >= 2 && e[0].t !== Ux && e[1].t === bS;
	}
}), pC = (e) => new Lx(e);
function mC({ groups: e }) {
	let t = e.domain.concat([
		pS,
		hS,
		gS,
		_S,
		vS,
		yS,
		SS,
		wS,
		ES,
		Jx,
		DS,
		OS,
		kS,
		AS,
		FS,
		zS,
		IS,
		LS
	]), n = [
		mS,
		bS,
		xS,
		CS,
		TS,
		DS,
		jS,
		MS,
		PS,
		rS,
		iS,
		Zx,
		Qx,
		eS,
		$x,
		tS,
		nS,
		aS,
		oS,
		sS,
		cS,
		lS,
		uS,
		dS,
		fS
	], r = [
		pS,
		mS,
		hS,
		_S,
		vS,
		yS,
		SS,
		wS,
		ES,
		Zx,
		Qx,
		DS,
		OS,
		kS,
		AS,
		jS,
		FS,
		zS,
		IS,
		LS
	], i = pC(), a = Z(i, IS);
	Y(a, r, a), Y(a, e.domain, a);
	let o = pC(), s = pC(), c = pC();
	Y(i, e.domain, o), Y(i, e.scheme, s), Y(i, e.slashscheme, c), Y(o, r, a), Y(o, e.domain, o);
	let l = Z(o, gS);
	Z(a, gS, l), Z(s, gS, l), Z(c, gS, l);
	let u = Z(a, CS);
	Y(u, r, a), Y(u, e.domain, a);
	let d = pC();
	Y(l, e.domain, d), Y(d, e.domain, d);
	let f = Z(d, CS);
	Y(f, e.domain, d);
	let p = pC(lC);
	Y(f, e.tld, p), Y(f, e.utld, p), Z(l, Ux, p);
	let m = Z(d, ES);
	Z(m, ES, m), Y(m, e.domain, d), Y(p, e.domain, d), Z(p, CS, f), Z(p, ES, m);
	let h = Z(o, ES), g = Z(o, CS);
	Z(h, ES, h), Y(h, e.domain, o), Y(g, r, a), Y(g, e.domain, o);
	let _ = pC(fC);
	Y(g, e.tld, _), Y(g, e.utld, _), Y(_, e.domain, o), Y(_, r, a), Z(_, CS, g), Z(_, ES, h), Z(_, gS, l);
	let ee = Z(_, bS), te = pC(fC);
	Y(ee, e.numeric, te);
	let v = pC(fC), y = pC();
	Y(v, t, v), Y(v, n, y), Y(y, t, v), Y(y, n, y), Z(_, FS, v), Z(te, FS, v), Z(_, jS, y), Z(_, AS, v), Z(te, jS, y), Z(te, AS, v);
	let ne = Z(s, bS), re = Z(Z(Z(c, bS), FS), FS);
	Y(s, e.domain, o), Z(s, CS, g), Z(s, ES, h), Y(c, e.domain, o), Z(c, CS, g), Z(c, ES, h), Y(ne, e.domain, v), Z(ne, FS, v), Z(ne, jS, v), Y(re, e.domain, v), Y(re, t, v), Z(re, FS, v);
	let ie = [
		[Zx, Qx],
		[$x, eS],
		[tS, nS],
		[rS, iS],
		[aS, oS],
		[sS, cS],
		[lS, uS],
		[dS, fS]
	];
	for (let e = 0; e < ie.length; e++) {
		let [r, i] = ie[e], a = Z(v, r);
		Z(y, r, a);
		let o = pC(fC);
		Y(a, t, o);
		let s = pC();
		Y(a, n, s), Z(a, i, v), Y(o, t, o), Y(o, n, s), Y(s, t, o), Y(s, n, s), Z(o, i, v), Z(s, i, v);
	}
	return Z(i, Ux, _), Z(i, Xx, dC), {
		start: i,
		tokens: BS
	};
}
function hC(e, t, n) {
	let r = n.length, i = 0, a = [], o = [], s = [];
	for (; i < r;) {
		let c = e, l = null, u = null, d = 0, f = null, p = -1, m = [];
		for (; i < r && !(l = c.go(n[i].t));) o.push(n[i++]);
		for (; i < r && (u = l || c.go(n[i].t));) if (l = null, c = u, i++, d++, c.accepts()) p = 0, f = c, m = [];
		else if (p >= 0 && p++, m.push(c), s[i] && s[i].has(c)) break;
		for (let e = 0, t = i - m.length + 1; e < m.length; e++, t++) (s[t] || (s[t] = /* @__PURE__ */ new Set())).add(m[e]);
		if (p < 0) i -= d, i < r && (o.push(n[i]), i++);
		else {
			o.length > 0 && (a.push(gC(uC, t, o)), o = []), i -= p, d -= p;
			let e = f.t, r = n.slice(i - d, i);
			a.push(gC(e, t, r));
		}
	}
	return o.length > 0 && a.push(gC(uC, t, o)), a;
}
function gC(e, t, n) {
	let r = n[0].s, i = n[n.length - 1].e;
	return new e(t.slice(r, i), n);
}
var _C = typeof console < "u" && console && console.warn || (() => {}), vC = "until manual call of linkify.init(). Register all schemes and plugins before invoking linkify the first time.", Q = {
	scanner: null,
	parser: null,
	tokenQueue: [],
	pluginQueue: [],
	customSchemes: [],
	initialized: !1
};
function yC() {
	return Lx.groups = {}, Q.scanner = null, Q.parser = null, Q.tokenQueue = [], Q.pluginQueue = [], Q.customSchemes = [], Q.initialized = !1, Q;
}
function bC(e, t = !1) {
	if (Q.initialized && _C(`linkifyjs: already initialized - will not register custom scheme "${e}" ${vC}`), !/^[0-9a-z]+(-[0-9a-z]+)*$/.test(e)) throw Error("linkifyjs: incorrect scheme format.\n1. Must only contain digits, lowercase ASCII letters or \"-\"\n2. Cannot start or end with \"-\"\n3. \"-\" cannot repeat");
	Q.customSchemes.push([e, t]);
}
function xC() {
	Q.scanner = $S(Q.customSchemes);
	for (let e = 0; e < Q.tokenQueue.length; e++) Q.tokenQueue[e][1]({ scanner: Q.scanner });
	Q.parser = mC(Q.scanner.tokens);
	for (let e = 0; e < Q.pluginQueue.length; e++) Q.pluginQueue[e][1]({
		scanner: Q.scanner,
		parser: Q.parser
	});
	return Q.initialized = !0, Q;
}
function SC(e) {
	return Q.initialized || xC(), hC(Q.parser.start, e, eC(Q.scanner.start, e));
}
SC.scan = eC;
function CC(e, t = null, n = null) {
	if (t && typeof t == "object") {
		if (n) throw Error(`linkifyjs: Invalid link type ${t}; must be a string`);
		n = t, t = null;
	}
	let r = new aC(n), i = SC(e), a = [];
	for (let e = 0; e < i.length; e++) {
		let n = i[e];
		n.isLink && (!t || n.t === t) && r.check(n) && a.push(n.toFormattedObject(r));
	}
	return a;
}
// node_modules/@tiptap/extension-link/dist/index.js
var wC = "[\0- \xA0 ᠎ -\u2029 　]", TC = new RegExp(wC), EC = RegExp(`${wC}$`), DC = RegExp(`${wC}+$`), OC = new RegExp(wC, "g");
function kC(e, t, n) {
	let r = e.doc.resolve(t.to);
	if (!r.nodeBefore?.isText) return;
	let i = e.doc.textBetween(t.from, t.to, "￼", "￼").match(DC)?.[0];
	if (!i) return;
	let a = t.to - i.length, o = yv(a, t.to, e.doc).filter((e) => e.mark.type === n);
	if (!o.length) return;
	let { nodeAfter: s } = r;
	if (s && o.some((e) => e.mark.isInSet(s.marks))) return;
	let c = e.storedMarks;
	e.removeMark(a, t.to, n), e.setStoredMarks(c), e.selection.empty && e.selection.from === t.to && e.removeStoredMark(n);
}
function AC(e) {
	return e.length === 1 ? e[0].isLink : e.length === 3 && e[1].isLink ? ["()", "[]"].includes(e[0].value + e[2].value) : !1;
}
function jC(e) {
	return new z({
		key: new B("autolink"),
		appendTransaction: (t, n, r) => {
			let i = t.some((e) => e.docChanged) && !n.doc.eq(r.doc), a = t.some((e) => e.getMeta("preventAutolink"));
			if (!i || a) return;
			let { tr: o } = r, s = I_(n.doc, [...t]);
			if (!t.some(gg)) {
				let t = [];
				s.steps.forEach((e, n) => {
					if (!(e instanceof nl) || !e.slice.size) return;
					let r = s.mapping.slice(n + 1), i = r.map(e.from, 1), a = r.map(e.from + e.slice.size, -1);
					i < a && t.push({
						from: i,
						to: a
					});
				}), t.sort((e, t) => t.to - e.to), t.forEach((t) => kC(o, t, e.type));
			}
			if (vv(s).forEach(({ newRange: t }) => {
				let n = L_(r.doc, t, (e) => e.isTextblock), i, a;
				if (n.length > 1) i = n[0], a = r.doc.textBetween(i.pos, i.pos + i.node.nodeSize, void 0, " ");
				else if (n.length) {
					let e = r.doc.textBetween(t.from, t.to, " ", " ");
					if (!EC.test(e)) return;
					i = n[0], a = r.doc.textBetween(i.pos, t.to, void 0, " ");
				}
				if (i && a) {
					let t = a.split(TC).filter(Boolean);
					if (t.length <= 0) return !1;
					let n = t[t.length - 1], s = i.pos + a.lastIndexOf(n);
					if (!n) return !1;
					let c = SC(n).map((t) => t.toObject(e.defaultProtocol));
					if (!AC(c)) return !1;
					c.filter((e) => e.isLink).map((e) => ({
						...e,
						from: s + e.start + 1,
						to: s + e.end + 1
					})).filter((e) => !r.schema.marks.code || !r.doc.rangeHasMark(e.from, e.to, r.schema.marks.code)).filter((t) => e.validate(t.value)).filter((t) => e.shouldAutoLink(t.value)).forEach((t) => {
						yv(t.from, t.to, r.doc).some((t) => t.mark.type === e.type) || o.addMark(t.from, t.to, e.type.create({ href: t.href }));
					});
				}
			}), o.steps.length) return o;
		}
	});
}
function MC(e) {
	return new z({
		key: new B("handleClickLink"),
		props: { handleClick: (t, n, r) => {
			if (r.button !== 0 || !t.editable) return !1;
			let i = null;
			if (r.target instanceof HTMLAnchorElement) i = r.target;
			else {
				let t = r.target;
				if (!t) return !1;
				let n = e.editor.view.dom;
				i = t.closest("a"), i && !n.contains(i) && (i = null);
			}
			if (!i) return !1;
			let a = !1;
			if (e.enableClickSelection && (a = e.editor.commands.extendMarkRange(e.type.name)), e.openOnClick) {
				let n = hv(t.state, e.type.name), r = i.href ?? n.href, o = i.target ?? n.target;
				r && (window.open(r, o), a = !0);
			}
			return a;
		} }
	});
}
var NC = /\[([^[\]]+)\]\(((?:[^\s()]|\([^\s()]*\))+)(?:\s+(?:(["'])(.*?)\3|“(.*?)”|‘(.*?)’))?\)$/, PC = /\[([^[\]]+)\]\(((?:[^\s()]|\([^\s()]*\))+)(?:\s+(?:(["'])(.*?)\3|“(.*?)”|‘(.*?)’))?\)/g;
function FC(e, t) {
	let n = 0;
	for (let r = t - 1; r >= 0 && e[r] === "\\"; --r) n += 1;
	return n % 2 == 1;
}
function IC(e, t) {
	let n = 0, r = 0;
	for (; r < t;) {
		if (e[r] !== "`" || n === 0 && FC(e, r)) {
			r += 1;
			continue;
		}
		let i = 0;
		for (; r < t && e[r] === "`";) i += 1, r += 1;
		n === 0 ? n = i : i === n && (n = 0);
	}
	return n > 0;
}
function LC(e, t, n) {
	let [, r, i] = t;
	return (t.index ? e[t.index - 1] : void 0) === "!" || FC(e, t.index ?? 0) || IC(e, t.index ?? 0) ? !1 : !!r.trim() && n(i);
}
function RC(e) {
	let [t, n, r, , i, a, o] = e, s = i ?? a ?? o;
	return {
		index: e.index ?? 0,
		text: t,
		replaceWith: n,
		data: {
			href: r,
			title: s || null,
			markdown: !0
		}
	};
}
function zC(e, t) {
	return e.index < t.index + t.text.length && t.index < e.index + e.text.length;
}
function BC(e) {
	return {
		href: e.data?.href,
		title: e.data?.title ?? null
	};
}
function VC(e) {
	let t = Rb({
		find: (t) => {
			let n = NC.exec(t);
			return !n || !LC(t, n, e.isAllowedHref) ? null : RC(n);
		},
		type: e.type,
		getAttributes: BC
	});
	return new ab({
		find: t.find,
		handler: (e) => {
			let n = t.handler(e);
			return n !== null && e.state.tr.steps.length && e.state.tr.setMeta("preventAutolink", !0), n;
		}
	});
}
function HC(e) {
	let t = Ub({
		find: (t) => {
			let n = [];
			for (let r of t.matchAll(PC)) LC(t, r, e.isAllowedHref) && n.push(RC(r));
			let r = (e.findPlainUrls?.call(e, t) ?? []).filter((e) => !n.some((t) => zC(t, e)));
			return [...n, ...r];
		},
		type: e.type,
		getAttributes: BC
	});
	return new mb({
		find: t.find,
		handler: (e) => {
			let n = t.handler(e);
			return n !== null && e.state.tr.steps.length && e.match.data?.markdown && e.state.tr.setMeta("preventAutolink", !0), n;
		}
	});
}
function UC(e) {
	return new z({
		key: new B("handlePasteLink"),
		props: { handlePaste: (t, n, r) => {
			let { shouldAutoLink: i } = e, { state: a } = t, { selection: o } = a, { empty: s } = o;
			if (s) return !1;
			let c = "";
			r.content.forEach((e) => {
				c += e.textContent;
			});
			let l = CC(c, { defaultProtocol: e.defaultProtocol }).find((e) => e.isLink && e.value === c);
			return !c || !l || i !== void 0 && !i(l.value) ? !1 : e.editor.commands.setMark(e.type, { href: l.href });
		} }
	});
}
function WC(e, t) {
	let n = [
		"http",
		"https",
		"ftp",
		"ftps",
		"mailto",
		"tel",
		"callto",
		"sms",
		"cid",
		"xmpp"
	];
	return t && t.forEach((e) => {
		let t = typeof e == "string" ? e : e.scheme;
		t && n.push(t);
	}), !e || e.replace(OC, "").match(RegExp(`^(?:(?:${n.map((e) => e.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")}):|[^a-z]|[a-z0-9+.\\-]+(?:[^a-z+.\\-:]|$))`, "i"));
}
var GC = pb.create({
	name: "link",
	priority: 1e3,
	keepOnSplit: !1,
	exitable: !0,
	onCreate() {
		this.options.validate && !this.options.shouldAutoLink && (this.options.shouldAutoLink = this.options.validate, console.warn("The `validate` option is deprecated. Rename to the `shouldAutoLink` option instead.")), this.options.protocols.forEach((e) => {
			typeof e == "string" ? bC(e) : bC(e.scheme, e.optionalSlashes);
		});
	},
	onDestroy() {
		yC();
	},
	inclusive() {
		return this.options.autolink;
	},
	addOptions() {
		return {
			openOnClick: !0,
			enableClickSelection: !1,
			linkOnPaste: !0,
			markdownLinks: !1,
			autolink: !0,
			protocols: [],
			defaultProtocol: "http",
			HTMLAttributes: {
				target: "_blank",
				rel: "noopener noreferrer nofollow",
				class: null
			},
			isAllowedUri: (e, t) => !!WC(e, t.protocols),
			validate: (e) => !!e,
			shouldAutoLink: (e) => {
				let t = /^[a-z][a-z0-9+.-]*:\/\//i.test(e), n = /^[a-z][a-z0-9+.-]*:/i.test(e);
				if (t || n && !e.includes("@")) return !0;
				let r = (e.includes("@") ? e.split("@").pop() : e).split(/[/?#:]/)[0];
				return !(/^\d{1,3}(\.\d{1,3}){3}$/.test(r) || !/\./.test(r));
			}
		};
	},
	addAttributes() {
		return {
			href: {
				default: null,
				parseHTML(e) {
					return e.getAttribute("href");
				}
			},
			target: { default: this.options.HTMLAttributes.target ?? null },
			rel: { default: this.options.HTMLAttributes.rel ?? null },
			class: { default: this.options.HTMLAttributes.class ?? null },
			title: { default: null }
		};
	},
	parseHTML() {
		return [{
			tag: "a[href]",
			getAttrs: (e) => {
				let t = e.getAttribute("href");
				return !t || !this.options.isAllowedUri(t, {
					defaultValidate: (e) => !!WC(e, this.options.protocols),
					protocols: this.options.protocols,
					defaultProtocol: this.options.defaultProtocol
				}) ? !1 : null;
			}
		}];
	},
	renderHTML({ HTMLAttributes: e }) {
		return this.options.isAllowedUri(e.href, {
			defaultValidate: (e) => !!WC(e, this.options.protocols),
			protocols: this.options.protocols,
			defaultProtocol: this.options.defaultProtocol
		}) ? [
			"a",
			q(this.options.HTMLAttributes, e),
			0
		] : [
			"a",
			q(this.options.HTMLAttributes, {
				...e,
				href: ""
			}),
			0
		];
	},
	markdownTokenName: "link",
	parseMarkdown: (e, t) => t.applyMark("link", t.parseInline(e.tokens || []), {
		href: e.href,
		title: e.title || null
	}),
	renderMarkdown: (e, t) => {
		let n = e.attrs?.href ?? "", r = e.attrs?.title ?? "", i = t.renderChildren(e);
		return r ? `[${i}](${n} "${r}")` : `[${i}](${n})`;
	},
	addCommands() {
		return {
			setLink: (e) => ({ chain: t }) => {
				let { href: n } = e;
				return this.options.isAllowedUri(n, {
					defaultValidate: (e) => !!WC(e, this.options.protocols),
					protocols: this.options.protocols,
					defaultProtocol: this.options.defaultProtocol
				}) ? t().setMark(this.name, e).setMeta("preventAutolink", !0).run() : !1;
			},
			toggleLink: (e) => ({ chain: t }) => {
				let { href: n } = e || {};
				return n && !this.options.isAllowedUri(n, {
					defaultValidate: (e) => !!WC(e, this.options.protocols),
					protocols: this.options.protocols,
					defaultProtocol: this.options.defaultProtocol
				}) ? !1 : t().toggleMark(this.name, e, { extendEmptyMarkRange: !0 }).setMeta("preventAutolink", !0).run();
			},
			unsetLink: () => ({ chain: e }) => e().unsetMark(this.name, { extendEmptyMarkRange: !0 }).setMeta("preventAutolink", !0).run()
		};
	},
	addInputRules() {
		return this.options.markdownLinks ? [VC({
			type: this.type,
			isAllowedHref: (e) => this.options.isAllowedUri(e, {
				defaultValidate: (e) => !!WC(e, this.options.protocols),
				protocols: this.options.protocols,
				defaultProtocol: this.options.defaultProtocol
			})
		})] : [];
	},
	addPasteRules() {
		let e = (e) => {
			let t = [];
			if (e) {
				let { protocols: n, defaultProtocol: r } = this.options;
				CC(e, { defaultProtocol: r }).filter((e) => e.isLink && this.options.isAllowedUri(e.value, {
					defaultValidate: (e) => !!WC(e, n),
					protocols: n,
					defaultProtocol: r
				})).forEach((e) => {
					this.options.shouldAutoLink(e.value) && t.push({
						text: e.value,
						data: { href: e.href },
						index: e.start
					});
				});
			}
			return t;
		};
		return this.options.markdownLinks ? [HC({
			type: this.type,
			isAllowedHref: (e) => this.options.isAllowedUri(e, {
				defaultValidate: (e) => !!WC(e, this.options.protocols),
				protocols: this.options.protocols,
				defaultProtocol: this.options.defaultProtocol
			}),
			findPlainUrls: e
		})] : [Ub({
			find: e,
			type: this.type,
			getAttributes: (e) => ({ href: e.data?.href })
		})];
	},
	addProseMirrorPlugins() {
		let e = [], { protocols: t, defaultProtocol: n } = this.options;
		return this.options.autolink && e.push(jC({
			type: this.type,
			defaultProtocol: this.options.defaultProtocol,
			validate: (e) => this.options.isAllowedUri(e, {
				defaultValidate: (e) => !!WC(e, t),
				protocols: t,
				defaultProtocol: n
			}),
			shouldAutoLink: this.options.shouldAutoLink
		})), e.push(MC({
			type: this.type,
			editor: this.editor,
			openOnClick: this.options.openOnClick === "whenNotEditable" || this.options.openOnClick,
			enableClickSelection: this.options.enableClickSelection
		})), this.options.linkOnPaste && e.push(UC({
			editor: this.editor,
			defaultProtocol: this.options.defaultProtocol,
			type: this.type,
			shouldAutoLink: this.options.shouldAutoLink
		})), e;
	}
}), KC = "listItem", qC = "textStyle", JC = /^\s*([-+*])\s$/, YC = Hb.create({
	name: "bulletList",
	addOptions() {
		return {
			itemTypeName: "listItem",
			HTMLAttributes: {},
			keepMarks: !1,
			keepAttributes: !1
		};
	},
	group: "block list",
	content() {
		return `${this.options.itemTypeName}+`;
	},
	parseHTML() {
		return [{ tag: "ul" }];
	},
	renderHTML({ HTMLAttributes: e }) {
		return [
			"ul",
			q(this.options.HTMLAttributes, e),
			0
		];
	},
	markdownTokenName: "list",
	parseMarkdown: (e, t) => e.type !== "list" || e.ordered ? [] : {
		type: "bulletList",
		content: e.items ? t.parseChildren(e.items) : []
	},
	renderMarkdown: (e, t) => e.content ? t.renderChildren(e.content, "\n") : "",
	markdownOptions: { indentsContent: !0 },
	addCommands() {
		return { toggleBulletList: () => ({ commands: e, chain: t }) => this.options.keepAttributes ? t().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(KC, this.editor.getAttributes(qC)).run() : e.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks) };
	},
	addKeyboardShortcuts() {
		return { "Mod-Shift-8": () => this.editor.commands.toggleBulletList() };
	},
	addInputRules() {
		let e = Vb({
			find: JC,
			type: this.type
		});
		return (this.options.keepMarks || this.options.keepAttributes) && (e = Vb({
			find: JC,
			type: this.type,
			keepMarks: this.options.keepMarks,
			keepAttributes: this.options.keepAttributes,
			getAttributes: () => this.editor.getAttributes(qC),
			editor: this.editor
		})), [e];
	}
}), XC = (e, t, n) => {
	let { selection: r } = e;
	if (!r.empty) return null;
	let { $from: i } = r;
	if (!i.parent.isTextblock || i.parentOffset !== i.parent.content.size) return null;
	let a = -1;
	for (let e = i.depth; e > 0; --e) if (i.node(e).type.name === t) {
		a = e;
		break;
	}
	if (a < 0) return null;
	let o = i.node(a), s = i.index(a);
	if (s + 1 >= o.childCount) return null;
	let c = o.child(s + 1);
	if (!n.includes(c.type.name)) return null;
	let l = e.schema.nodes[t], u = !1;
	if (c.forEach((e) => {
		e.type === l && e.childCount > 1 && (u = !0);
	}), !u) return null;
	let d = e.doc.resolve(i.after()).nodeAfter;
	if (!d || !n.includes(d.type.name)) return null;
	let f = [];
	return d.forEach((e) => {
		f.push(e);
	}), f.length === 0 ? null : {
		listItemDepth: a,
		nestedList: d,
		nestedListPos: i.after(),
		insertPos: i.after(a),
		items: f
	};
}, ZC = (e, t, n, r) => {
	let i = XC(e, n, r);
	if (!i) return !1;
	let { selection: a } = e, { nestedList: o, nestedListPos: s, insertPos: c, items: l } = i, u = e.tr;
	u.delete(s, s + o.nodeSize);
	let d = u.mapping.map(c);
	return u.insert(d, M.from(l)), u.setSelection(a.map(u.doc, u.mapping)), t && t(u), !0;
}, QC = (e, t, n) => ZC(e.state, e.view.dispatch, t, n), $C = (e, t) => J.create({
	name: `${e}BranchingDeleteKeymap`,
	priority: 101,
	addKeyboardShortcuts() {
		let n = () => QC(this.editor, e, t);
		return {
			Delete: n,
			"Mod-Delete": n
		};
	}
}), ew = [
	[1e3, "m"],
	[900, "cm"],
	[500, "d"],
	[400, "cd"],
	[100, "c"],
	[90, "xc"],
	[50, "l"],
	[40, "xl"],
	[10, "x"],
	[9, "ix"],
	[5, "v"],
	[4, "iv"],
	[1, "i"]
], tw = "abcdefghijklmnopqrstuvwxyz", nw = String.raw`\d+|[ivxlcdmIVXLCDM]+|${"[a-zA-Z]{1,2}"}`;
function rw(e) {
	let t = e, n = "";
	for (let [e, r] of ew) for (; t >= e;) n += r, t -= e;
	return n;
}
function iw(e) {
	return rw(e).toUpperCase();
}
function aw(e) {
	let t = e.toLowerCase(), n = 0, r = 0;
	for (; n < t.length;) {
		let e = !1;
		for (let [i, a] of ew) if (t.startsWith(a, n)) {
			r += i, n += a.length, e = !0;
			break;
		}
		if (!e) return 0;
	}
	return r;
}
function ow(e) {
	if (!/^[ivxlcdmIVXLCDM]+$/.test(e)) return !1;
	let t = aw(e);
	return t <= 0 ? !1 : (e === e.toLowerCase() ? rw(t) : iw(t)) === e;
}
function sw(e) {
	let t = e.toLowerCase();
	if (t.length === 1) return t.charCodeAt(0) - 97 + 1;
	if (t.length === 2) {
		let e = t.charCodeAt(0) - 97, n = t.charCodeAt(1) - 97;
		return (e + 1) * 26 + n + 1;
	}
	return 0;
}
function cw(e) {
	if (e <= 26) return tw[e - 1];
	let t = Math.floor((e - 1) / 26) - 1, n = (e - 1) % 26;
	return t < 0 ? tw[n] : tw[t] + tw[n];
}
function lw(e) {
	if (e && !/^\d+$/.test(e)) {
		if (ow(e)) return e === e.toLowerCase() ? "i" : "I";
		if (/^[a-z]{1,2}$/.test(e)) return "a";
		if (/^[A-Z]{1,2}$/.test(e)) return "A";
	}
}
function uw(e) {
	if (/^\d+$/.test(e)) return parseInt(e, 10);
	let t = lw(e);
	if (t === "i" || t === "I") return aw(e);
	if (t === "a" || t === "A") {
		let t = sw(e);
		return t > 0 ? t : 1;
	}
	let n = parseInt(e, 10);
	return Number.isNaN(n) ? 1 : n;
}
function dw(e, t) {
	if (e === "numeric") return String(t);
	switch (e) {
		case "a": return cw(t);
		case "A": return cw(t).toUpperCase();
		case "i": return rw(t);
		case "I": return iw(t);
		default: return String(t);
	}
}
function fw(e) {
	if (e.length === 0) return !1;
	let t = lw(e[0]) ?? "numeric", n = uw(e[0]);
	if (n < 1) return !1;
	for (let r = 0; r < e.length; r++) {
		let i = dw(t, n + r);
		if (e[r] !== i) return !1;
	}
	return !0;
}
function pw(e) {
	return {
		type: lw(e),
		start: uw(e)
	};
}
function mw(e) {
	let { type: t, start: n } = pw(e), r = {};
	return t && (r.type = t), n !== 1 && (r.start = n), r;
}
function hw(e, t, n = ". ") {
	let r = t + 1;
	if (!e || e === "1") return `${r}${n}`;
	switch (e) {
		case "a": return `${cw(r)}${n}`;
		case "A": return `${cw(r).toUpperCase()}${n}`;
		case "i": return `${rw(r)}${n}`;
		case "I": return `${iw(r)}${n}`;
		default: return `${r}${n}`;
	}
}
function gw(e) {
	return !e[0] || e[0].type === "paragraph" ? e : [{
		type: "paragraph",
		content: []
	}, ...e];
}
function _w(e) {
	let t = e.content?.[0];
	return t?.type === "paragraph" && !t.content?.length;
}
var vw = "&nbsp;", yw = 1, bw = (e) => (e?.level ?? yw) > yw;
function xw(e) {
	let t = e.tokens?.[0];
	return !!(e.text && e.tokens?.length === 1 && t?.type === "list" && t.ordered && t.raw === e.text);
}
function Sw(e, t) {
	return t.tokenizeInline ? t.parseInline(t.tokenizeInline(e)) : t.parseInline([{
		type: "text",
		raw: e,
		text: e
	}]);
}
var Cw = Hb.create({
	name: "listItem",
	addOptions() {
		return {
			HTMLAttributes: {},
			bulletListTypeName: "bulletList",
			orderedListTypeName: "orderedList"
		};
	},
	content: "paragraph block*",
	defining: !0,
	parseHTML() {
		return [{ tag: "li" }];
	},
	renderHTML({ HTMLAttributes: e }) {
		return [
			"li",
			q(this.options.HTMLAttributes, e),
			0
		];
	},
	markdownTokenName: "list_item",
	parseMarkdown: (e, t) => {
		if (e.type !== "list_item") return [];
		let n = t.parseBlockChildren ?? t.parseChildren, r = [];
		if (e.tokens && e.tokens.length > 0) {
			if (xw(e)) return {
				type: "listItem",
				content: [{
					type: "paragraph",
					content: Sw(e.text || "", t)
				}]
			};
			let [i, ...a] = e.tokens;
			if (i.type === "heading") return {
				type: "listItem",
				content: [{
					type: "paragraph",
					content: t.parseInline(i.tokens ?? [])
				}, ...a.length > 0 ? n(a) : []]
			};
			if (e.tokens.some((e) => e.type === "paragraph")) r = n(e.tokens);
			else if (i.type === "text" && i.tokens && i.tokens.length > 0) {
				if (r = [{
					type: "paragraph",
					content: t.parseInline(i.tokens)
				}], e.tokens.length > 1) {
					let t = n(e.tokens.slice(1));
					r.push(...t);
				}
			} else r = n(e.tokens);
		}
		return r.length === 0 && (r = [{
			type: "paragraph",
			content: []
		}]), {
			type: "listItem",
			content: gw(r)
		};
	},
	renderMarkdown: (e, t, n) => {
		let r = (e) => {
			if (e.parentType === "bulletList") return "- ";
			if (e.parentType === "orderedList") {
				var t, n;
				let r = ((t = e.meta) == null || (t = t.parentAttrs) == null ? void 0 : t.start) || 1;
				return hw((n = e.meta) == null || (n = n.parentAttrs) == null ? void 0 : n.type, r - 1 + (e.index || 0), ". ");
			}
			return "- ";
		}, i = nb(e, t, r, n, { alignNestedToPrefix: n?.parentType === "orderedList" });
		if (!_w(e) || !bw(n)) return i;
		let a = r(n);
		return `${a}${vw}${i.slice(a.length)}`;
	},
	addExtensions() {
		return [$C(this.name, [this.options.bulletListTypeName, this.options.orderedListTypeName])];
	},
	addKeyboardShortcuts() {
		return {
			Enter: () => this.editor.commands.splitListItem(this.name),
			Tab: () => this.editor.commands.sinkListItem(this.name),
			"Shift-Tab": () => this.editor.commands.liftListItem(this.name)
		};
	}
}), ww = (e, t) => {
	let { $from: n } = t.selection, r = W(e, t.schema), i = null, a = n.depth, o = n.pos, s = null;
	for (; a > 0 && s === null;) i = n.node(a), i.type === r ? s = a : (--a, --o);
	return s === null ? null : {
		$pos: t.doc.resolve(o),
		depth: s
	};
}, Tw = (e, t) => {
	let n = ww(e, t);
	if (!n) return !1;
	let [, r] = bv(t, e, n.$pos.pos + 4);
	return r;
}, Ew = (e, t, n) => {
	let { $anchor: r } = e.selection, i = Math.max(0, r.pos - 2), a = e.doc.resolve(i).node();
	return !(!a || !n.includes(a.type.name));
}, Dw = (e, t, n) => {
	if (e.commands.undoInputRule()) return !0;
	if (e.state.selection.from !== e.state.selection.to) return !1;
	if (!v_(e.state, t) && Ew(e.state, t, n)) {
		let { $anchor: n } = e.state.selection, r = e.state.doc.resolve(n.before() - 1), i = [];
		r.node().descendants((e, n) => {
			e.type.name === t && i.push({
				node: e,
				pos: n
			});
		});
		let a = i.at(-1);
		if (!a) return !1;
		let o = e.state.doc.resolve(r.start() + a.pos + 1);
		return e.chain().command(({ tr: e }) => {
			let t = o.end();
			return e.delete(n.before(), n.after()).insert(t, n.parent), e.setSelection(L.create(e.doc, t + 1)), !0;
		}).command(({ state: e, dispatch: t }) => (xu(e, t), !0)).run();
	}
	if (!v_(e.state, t) || !Ov(e.state)) return !1;
	let { $from: r } = e.state.selection, i = r.depth - 1;
	return r.node(i).type !== e.schema.nodes[t] || r.index(i) !== 0 ? !1 : e.chain().liftListItem(t).run();
}, Ow = (e, t) => {
	let n = Tw(e, t), r = ww(e, t);
	return !r || !n ? !1 : n > r.depth;
}, kw = (e, t) => {
	let n = Tw(e, t), r = ww(e, t);
	return !r || !n ? !1 : n < r.depth;
}, Aw = (e, t) => !v_(e.state, t) || !Dv(e.state, t) || !e.state.selection.empty ? !1 : Ow(t, e.state) ? e.chain().focus(e.state.selection.from + 4).lift(t).joinBackward().run() : kw(t, e.state) ? e.commands.command(({ state: e, dispatch: t }) => Su(e, t)) : e.commands.joinItemForward(), jw = (e, t, n) => {
	let { state: r } = e, { selection: i } = r;
	if (!i.empty) return !1;
	let { $from: a } = i;
	if (a.parentOffset !== 0 || !a.parent.isTextblock || v_(r, t)) return !1;
	let o = xv(a);
	if (!o || !n.includes(o.type.name)) return !1;
	let s = o.lastChild;
	if (!s || s.type.name !== t) return !1;
	let c = a.parent;
	if (!s.canReplace(s.childCount, s.childCount, M.from(c))) return !1;
	let l = a.before(), u = a.after(), d = l - 2;
	return e.commands.command(({ tr: e, dispatch: t }) => (t && (e.delete(l, u).insert(d, M.from(c)), e.setSelection(L.create(e.doc, d + 1)), e.scrollIntoView()), !0));
}, Mw = J.create({
	name: "listKeymap",
	addOptions() {
		return { listTypes: [{
			itemName: "listItem",
			wrapperNames: ["bulletList", "orderedList"]
		}, {
			itemName: "taskItem",
			wrapperNames: ["taskList"]
		}] };
	},
	addKeyboardShortcuts() {
		return {
			Delete: ({ editor: e }) => {
				let t = !1;
				return this.options.listTypes.forEach(({ itemName: n }) => {
					e.state.schema.nodes[n] !== void 0 && Aw(e, n) && (t = !0);
				}), t;
			},
			"Mod-Delete": ({ editor: e }) => {
				let t = !1;
				return this.options.listTypes.forEach(({ itemName: n }) => {
					e.state.schema.nodes[n] !== void 0 && Aw(e, n) && (t = !0);
				}), t;
			},
			Backspace: ({ editor: e }) => {
				let t = !1;
				return this.options.listTypes.forEach(({ itemName: n, wrapperNames: r }) => {
					e.state.schema.nodes[n] !== void 0 && Dw(e, n, r) && (t = !0);
				}), t;
			},
			"Mod-Backspace": ({ editor: e }) => {
				let t = !1;
				return this.options.listTypes.forEach(({ itemName: n, wrapperNames: r }) => {
					e.state.schema.nodes[n] !== void 0 && Dw(e, n, r) && (t = !0);
				}), t;
			},
			Tab: ({ editor: e }) => {
				for (let { itemName: t, wrapperNames: n } of this.options.listTypes) if (e.state.schema.nodes[t] !== void 0 && jw(e, t, n)) return !0;
				return !1;
			}
		};
	}
}), Nw = RegExp(`^(\\s*)(${nw})([.)])\\s+(.*)$`), Pw = /^\s/, Fw = {
	heading: /^#{1,6}(?:\s|$)/,
	bulletItem: /^[-+*]\s+/,
	codeFence: /^(?:```|~~~)/,
	blockMath: /^\$\$/,
	thematicBreak: /^(?:(?:-[ \t]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})$/
};
function Iw(e) {
	return Nw.test(e.trimStart());
}
function Lw(e) {
	let t = e.trimStart();
	return Fw.bulletItem.test(t) || Iw(t) || Fw.heading.test(t) || Fw.thematicBreak.test(t) && !t.startsWith("-") || /^>\s?/.test(t) || Fw.codeFence.test(t) || Fw.blockMath.test(t);
}
function Rw(e) {
	return Object.values(Fw).some((t) => t.test(e));
}
function zw(e) {
	let t = [], n = [], r = !1;
	return e.forEach((e) => {
		r ? n.push(e) : e.trim() === "" || t.length > 0 && Lw(e) ? (r = !0, n.push(e)) : t.push(e);
	}), {
		paragraphLines: t,
		blockLines: n
	};
}
function Bw(e) {
	let t = [], n = 0, r = 0;
	for (; n < e.length;) {
		let i = e[n], a = i.match(Nw);
		if (!a) break;
		let [, o, s, c, l] = a, u = o.length, d = parseInt(s, 10), f = isNaN(d) ? lw(s) : void 0, p = isNaN(d) ? uw(s) : d, m = [l], h = n + 1, g = [i], _ = !1;
		for (; h < e.length;) {
			let t = e[h];
			if (t.match(Nw)) break;
			if (t.trim() === "") g.push(t), m.push(""), _ = !0, h += 1;
			else if (t.match(Pw)) {
				let e = t.length - t.trimStart().length, n = u + s.length + 1;
				g.push(t), m.push(t.slice(Math.min(e, n))), h += 1;
			} else {
				if (_ || Rw(t)) break;
				g.push(t), m.push(t), h += 1;
			}
		}
		t.push({
			indent: u,
			number: p,
			type: f,
			content: m.join("\n").trim(),
			contentLines: m,
			raw: g.join("\n")
		}), r = h, n = h;
	}
	return [t, r];
}
var Vw = RegExp(`^(${nw})([.)])\\s+(.+)$`);
function Hw(e) {
	let t = e.split("\n").filter((e) => e.trim().length > 0);
	if (t.length === 0) return null;
	let n = [];
	for (let e of t) {
		let t = e.trim().match(Vw);
		if (!t) return null;
		n.push({
			marker: t[1],
			content: t[3]
		});
	}
	return fw(n.map((e) => e.marker)) ? {
		type: "orderedList",
		attrs: mw(n[0].marker),
		content: n.map((e) => ({
			type: "listItem",
			content: [{
				type: "paragraph",
				content: [{
					type: "text",
					text: e.content
				}]
			}]
		}))
	} : null;
}
function Uw(e, t, n) {
	let r = [], i = 0;
	for (; i < e.length;) {
		let a = e[i];
		if (a.indent === t) {
			let { paragraphLines: o, blockLines: s } = zw(a.contentLines), c = o.join("\n").trim(), l = [];
			c && l.push({
				type: "paragraph",
				raw: c,
				tokens: n.inlineTokens(c)
			});
			let u = s.join("\n").trim();
			if (u) {
				let e = n.blockTokens(u);
				l.push(...e);
			}
			let d = i + 1, f = [];
			for (; d < e.length && e[d].indent > t;) f.push(e[d]), d += 1;
			if (f.length > 0) {
				let e = Uw(f, Math.min(...f.map((e) => e.indent)), n);
				l.push({
					type: "list",
					ordered: !0,
					start: f[0].number,
					typeMarker: f[0].type,
					items: e,
					raw: f.map((e) => e.raw).join("\n")
				});
			}
			r.push({
				type: "list_item",
				raw: a.raw,
				tokens: l
			}), i = d;
		} else i += 1;
	}
	return r;
}
function Ww(e, t) {
	return e.map((e) => {
		if (e.type !== "list_item") return t.parseChildren([e])[0];
		let n = [];
		return e.tokens && e.tokens.length > 0 && e.tokens.forEach((e) => {
			if (e.type === "paragraph" || e.type === "list" || e.type === "blockquote" || e.type === "code") n.push(...t.parseChildren([e]));
			else if (e.type === "text" && e.tokens) {
				let r = t.parseChildren([e]);
				n.push({
					type: "paragraph",
					content: r
				});
			} else {
				let r = t.parseChildren([e]);
				r.length > 0 && n.push(...r);
			}
		}), {
			type: "listItem",
			content: n
		};
	});
}
var Gw = 64;
function Kw(e, t) {
	let n = [], r = 0;
	for (; n.length < t;) {
		let t = e.indexOf("\n", r);
		if (t === -1) return n.push(e.slice(r)), n;
		n.push(e.slice(r, t)), r = t + 1;
	}
	return n;
}
function qw(e) {
	let t = e.indexOf("\n"), n = t === -1 ? e : e.slice(0, t);
	if (!Nw.test(n)) return [
		[],
		0,
		[]
	];
	let r = Gw, i = Kw(e, r), a = Bw(i);
	for (; a[1] === i.length && i.length === r;) r *= 2, i = Kw(e, r), a = Bw(i);
	return [
		a[0],
		a[1],
		i
	];
}
var Jw = "listItem", Yw = "textStyle", Xw = /^(\d+)\.\s$/;
function Zw(e) {
	let t = e.match(/list-style-type\s*:\s*([^;]+)/i);
	if (!t) return null;
	switch (t[1].trim().toLowerCase()) {
		case "upper-roman": return "I";
		case "lower-roman": return "i";
		case "upper-alpha":
		case "upper-latin": return "A";
		case "lower-alpha":
		case "lower-latin": return "a";
		default: return null;
	}
}
var Qw = Hb.create({
	name: "orderedList",
	addOptions() {
		return {
			itemTypeName: "listItem",
			HTMLAttributes: {},
			keepMarks: !1,
			keepAttributes: !1
		};
	},
	group: "block list",
	content() {
		return `${this.options.itemTypeName}+`;
	},
	addAttributes() {
		return {
			start: {
				default: 1,
				parseHTML: (e) => e.hasAttribute("start") ? parseInt(e.getAttribute("start") || "", 10) : 1
			},
			type: {
				default: null,
				parseHTML: (e) => {
					let t = e.getAttribute("type");
					if (t) return t;
					let n = e.getAttribute("style");
					if (n) {
						let e = Zw(n);
						if (e) return e;
					}
					let r = e.querySelector("li");
					if (r) {
						let e = r.getAttribute("style");
						if (e) {
							let t = Zw(e);
							if (t) return t;
						}
					}
					return null;
				}
			}
		};
	},
	parseHTML() {
		return [{ tag: "ol" }];
	},
	renderHTML({ HTMLAttributes: e }) {
		let { start: t, type: n, ...r } = e, i = q(this.options.HTMLAttributes, r);
		return t !== 1 && (i.start = t), n && n !== "1" && (i.type = n), [
			"ol",
			i,
			0
		];
	},
	markdownTokenName: "list",
	parseMarkdown: (e, t) => {
		if (e.type !== "list" || !e.ordered) return [];
		let n = e.start || 1, r = e.typeMarker, i = e.items ? Ww(e.items, t) : [], a = {};
		return n !== 1 && (a.start = n), r && (a.type = r), Object.keys(a).length > 0 ? {
			type: "orderedList",
			attrs: a,
			content: i
		} : {
			type: "orderedList",
			content: i
		};
	},
	renderMarkdown: (e, t) => e.content ? t.renderChildren(e.content, "\n") : "",
	markdownTokenizer: {
		name: "orderedList",
		level: "block",
		start: () => -1,
		tokenize: (e, t, n) => {
			let [r, i, a] = qw(e);
			if (r.length === 0) return;
			let o = Uw(r, r[0].indent, n);
			if (o.length !== 0) return {
				type: "list",
				ordered: !0,
				start: r[0]?.number || 1,
				typeMarker: r[0]?.type,
				items: o,
				raw: a.slice(0, i).join("\n")
			};
		}
	},
	markdownOptions: { indentsContent: !0 },
	addCommands() {
		return { toggleOrderedList: () => ({ commands: e, chain: t }) => this.options.keepAttributes ? t().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(Jw, this.editor.getAttributes(Yw)).run() : e.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks) };
	},
	addKeyboardShortcuts() {
		return { "Mod-Shift-7": () => this.editor.commands.toggleOrderedList() };
	},
	addProseMirrorPlugins() {
		return [new z({ props: { handlePaste: (e, t) => {
			if ((t.clipboardData?.getData("text/html"))?.trim()) return !1;
			let n = t.clipboardData?.getData("text/plain");
			if (!n) return !1;
			let r = Hw(n);
			if (!r) return !1;
			try {
				let t = e.state.schema.nodeFromJSON(r), n = e.state.tr.replaceSelectionWith(t);
				return e.dispatch(n), !0;
			} catch {
				return !1;
			}
		} } })];
	},
	addInputRules() {
		let e = (e, t) => (!t.attrs.type || t.attrs.type === "1") && t.childCount + t.attrs.start === +e[1], t = Vb({
			find: Xw,
			type: this.type,
			getAttributes: (e) => ({ start: +e[1] }),
			joinPredicate: e
		});
		return (this.options.keepMarks || this.options.keepAttributes) && (t = Vb({
			find: Xw,
			type: this.type,
			keepMarks: this.options.keepMarks,
			keepAttributes: this.options.keepAttributes,
			getAttributes: (e) => ({
				start: +e[1],
				...this.editor.getAttributes(Yw)
			}),
			joinPredicate: e,
			editor: this.editor
		})), [t];
	}
}), $w = /^\s*(\[([( |x])?\])\s$/, eT = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0", tT = (e, t, n) => {
	var r;
	return (n == null || (r = n.checkboxLabel) == null ? void 0 : r.call(n, e, t)) || `Task item checkbox for ${e.textContent || "empty task item"}`;
}, nT = Hb.create({
	name: "taskItem",
	addOptions() {
		return {
			nested: !1,
			HTMLAttributes: {},
			taskListTypeName: "taskList",
			a11y: void 0
		};
	},
	content() {
		return this.options.nested ? "paragraph block*" : "paragraph+";
	},
	defining: !0,
	addAttributes() {
		return { checked: {
			default: !1,
			keepOnSplit: !1,
			parseHTML: (e) => {
				let t = e.getAttribute("data-checked");
				return t === "" || t === "true";
			},
			renderHTML: (e) => ({ "data-checked": e.checked })
		} };
	},
	parseHTML() {
		return [{
			tag: `li[data-type="${this.name}"]`,
			priority: 51,
			contentElement: (e) => e.querySelector("div") ?? e
		}];
	},
	renderHTML({ node: e, HTMLAttributes: t }) {
		return [
			"li",
			q(this.options.HTMLAttributes, t, { "data-type": this.name }),
			[
				"label",
				["input", {
					type: "checkbox",
					checked: e.attrs.checked ? "checked" : null
				}],
				["span"]
			],
			["div", 0]
		];
	},
	parseMarkdown: (e, t) => {
		let n = [];
		if (e.tokens && e.tokens.length > 0 ? n.push(t.createNode("paragraph", {}, t.parseInline(e.tokens))) : e.text ? n.push(t.createNode("paragraph", {}, [t.createNode("text", { text: e.text })])) : n.push(t.createNode("paragraph", {}, [])), e.nestedTokens && e.nestedTokens.length > 0) {
			let r = t.parseChildren(e.nestedTokens);
			n.push(...r);
		}
		return t.createNode("taskItem", { checked: e.checked || !1 }, n);
	},
	renderMarkdown: (e, t) => nb(e, t, `- [${e.attrs?.checked ? "x" : " "}] `, void 0, { indentMainContent: !0 }),
	addExtensions() {
		return this.options.nested ? [$C(this.name, [this.options.taskListTypeName])] : [];
	},
	addKeyboardShortcuts() {
		let e = {
			Enter: () => this.editor.commands.splitListItem(this.name),
			"Shift-Tab": () => this.editor.commands.liftListItem(this.name)
		};
		return this.options.nested ? {
			...e,
			Tab: () => this.editor.commands.sinkListItem(this.name)
		} : e;
	},
	addNodeView() {
		return ({ node: e, HTMLAttributes: t, getPos: n, editor: r }) => {
			let i = document.createElement("li"), a = document.createElement("label"), o = document.createElement("span"), s = document.createElement("input"), c = document.createElement("div");
			o.style.cssText = eT;
			let l = (e) => {
				let t = tT(e, e.attrs.checked, this.options.a11y);
				s.setAttribute("aria-label", t), o.textContent = t;
			};
			l(e), a.contentEditable = "false", s.type = "checkbox", s.addEventListener("mousedown", (e) => e.preventDefault()), s.addEventListener("change", (t) => {
				if (!r.isEditable && !this.options.onReadOnlyChecked) {
					s.checked = !s.checked;
					return;
				}
				let { checked: i } = t.target;
				r.isEditable && typeof n == "function" && r.chain().focus(void 0, { scrollIntoView: !1 }).command(({ tr: e }) => {
					let t = n();
					if (typeof t != "number") return !1;
					let r = e.doc.nodeAt(t);
					return e.setNodeMarkup(t, void 0, {
						...r?.attrs,
						checked: i
					}), !0;
				}).run(), !r.isEditable && this.options.onReadOnlyChecked && (this.options.onReadOnlyChecked(e, i) || (s.checked = !s.checked));
			}), Object.entries(this.options.HTMLAttributes).forEach(([e, t]) => {
				i.setAttribute(e, t);
			}), i.dataset.checked = e.attrs.checked, s.checked = e.attrs.checked, a.append(s, o), i.append(a, c), Object.entries(t).forEach(([e, t]) => {
				i.setAttribute(e, t);
			});
			let u = new Set(Object.keys(t));
			return {
				dom: i,
				contentDOM: c,
				update: (e) => {
					if (e.type !== this.type) return !1;
					i.dataset.checked = e.attrs.checked, s.checked = e.attrs.checked, l(e);
					let t = r.extensionManager.attributes, n = nv(e, t), a = new Set(Object.keys(n)), o = this.options.HTMLAttributes;
					return u.forEach((e) => {
						a.has(e) || (e in o ? i.setAttribute(e, o[e]) : i.removeAttribute(e));
					}), Object.entries(n).forEach(([e, t]) => {
						t == null ? e in o ? i.setAttribute(e, o[e]) : i.removeAttribute(e) : i.setAttribute(e, t);
					}), u = a, !0;
				}
			};
		};
	},
	addInputRules() {
		return [Vb({
			find: $w,
			type: this.type,
			getAttributes: (e) => ({ checked: e[e.length - 1] === "x" })
		})];
	}
}), rT = Hb.create({
	name: "taskList",
	addOptions() {
		return {
			itemTypeName: "taskItem",
			HTMLAttributes: {}
		};
	},
	group: "block list",
	content() {
		return `${this.options.itemTypeName}+`;
	},
	parseHTML() {
		return [{
			tag: `ul[data-type="${this.name}"]`,
			priority: 51
		}];
	},
	renderHTML({ HTMLAttributes: e }) {
		return [
			"ul",
			q(this.options.HTMLAttributes, e, { "data-type": this.name }),
			0
		];
	},
	parseMarkdown: (e, t) => t.createNode("taskList", {}, t.parseChildren(e.items || [])),
	renderMarkdown: (e, t) => e.content ? t.renderChildren(e.content, "\n") : "",
	markdownTokenizer: {
		name: "taskList",
		level: "block",
		start(e) {
			let t = e.match(/^\s*[-+*]\s+\[([ xX])\]\s+/)?.index;
			return t === void 0 ? -1 : t;
		},
		tokenize(e, t, n) {
			let r = (e) => {
				let t = $y(e, {
					itemPattern: /^(\s*)([-+*])\s+\[([ xX])\]\s+(.*)$/,
					extractItemData: (e) => ({
						indentLevel: e[1].length,
						mainContent: e[4],
						checked: e[3].toLowerCase() === "x"
					}),
					createToken: (e, t) => ({
						type: "taskItem",
						raw: "",
						mainContent: e.mainContent,
						indentLevel: e.indentLevel,
						checked: e.checked,
						text: e.mainContent,
						tokens: n.inlineTokens(e.mainContent),
						nestedTokens: t
					}),
					customNestedParser: r
				}, n);
				if (t) {
					let r = {
						type: "taskList",
						raw: t.raw,
						items: t.items
					}, i = e.slice(t.raw.length);
					return i.trim() ? [r, ...n.blockTokens(i)] : [r];
				}
				return n.blockTokens(e);
			}, i = $y(e, {
				itemPattern: /^(\s*)([-+*])\s+\[([ xX])\]\s+(.*)$/,
				extractItemData: (e) => ({
					indentLevel: e[1].length,
					mainContent: e[4],
					checked: e[3].toLowerCase() === "x"
				}),
				createToken: (e, t) => ({
					type: "taskItem",
					raw: "",
					mainContent: e.mainContent,
					indentLevel: e.indentLevel,
					checked: e.checked,
					text: e.mainContent,
					tokens: n.inlineTokens(e.mainContent),
					nestedTokens: t
				}),
				customNestedParser: r
			}, n);
			if (i) return {
				type: "taskList",
				raw: i.raw,
				items: i.items
			};
		}
	},
	markdownOptions: { indentsContent: !0 },
	addCommands() {
		return { toggleTaskList: () => ({ commands: e }) => e.toggleList(this.name, this.options.itemTypeName) };
	},
	addKeyboardShortcuts() {
		return { "Mod-Shift-9": () => this.editor.commands.toggleTaskList() };
	}
});
J.create({
	name: "listKit",
	addExtensions() {
		let e = [];
		return this.options.bulletList !== !1 && e.push(YC.configure(this.options.bulletList)), this.options.listItem !== !1 && e.push(Cw.configure(this.options.listItem)), this.options.listKeymap !== !1 && e.push(Mw.configure(this.options.listKeymap)), this.options.orderedList !== !1 && e.push(Qw.configure(this.options.orderedList)), this.options.taskItem !== !1 && e.push(nT.configure(this.options.taskItem)), this.options.taskList !== !1 && e.push(rT.configure(this.options.taskList)), e;
	}
});
// node_modules/@tiptap/extension-paragraph/dist/index.js
var iT = "&nbsp;", aT = "\xA0", oT = Hb.create({
	name: "paragraph",
	priority: 1e3,
	addOptions() {
		return { HTMLAttributes: {} };
	},
	group: "block",
	content: "inline*",
	parseHTML() {
		return [{ tag: "p" }];
	},
	renderHTML({ HTMLAttributes: e }) {
		return [
			"p",
			q(this.options.HTMLAttributes, e),
			0
		];
	},
	parseMarkdown: (e, t) => {
		let n = e.tokens || [];
		if (n.length === 1 && n[0].type === "image") return t.parseChildren([n[0]]);
		let r = t.parseInline(n);
		return n.length === 1 && n[0].type === "text" && (n[0].raw === iT || n[0].text === iT || n[0].raw === aT || n[0].text === aT) && r.length === 1 && r[0].type === "text" && (r[0].text === iT || r[0].text === aT) ? t.createNode("paragraph", void 0, []) : t.createNode("paragraph", void 0, r);
	},
	renderMarkdown: (e, t, n) => {
		if (!e) return "";
		let r = Array.isArray(e.content) ? e.content : [];
		if (r.length === 0) {
			var i, a;
			let e = Array.isArray(n == null || (i = n.previousNode) == null ? void 0 : i.content) ? n.previousNode.content : [];
			return (n == null || (a = n.previousNode) == null ? void 0 : a.type) === "paragraph" && e.length === 0 ? iT : "";
		}
		return t.renderChildren(r);
	},
	addCommands() {
		return { setParagraph: () => ({ commands: e }) => e.setNode(this.name) };
	},
	addKeyboardShortcuts() {
		return { "Mod-Alt-0": () => this.editor.commands.setParagraph() };
	}
}), sT = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))$/, cT = /(?:^|\s)(~~(?!\s+~~)((?:[^~]+))~~(?!\s+~~))/g, lT = pb.create({
	name: "strike",
	addOptions() {
		return { HTMLAttributes: {} };
	},
	parseHTML() {
		return [
			{ tag: "s" },
			{ tag: "del" },
			{ tag: "strike" },
			{
				style: "text-decoration",
				consuming: !1,
				getAttrs: (e) => e.includes("line-through") ? {} : !1
			}
		];
	},
	renderHTML({ HTMLAttributes: e }) {
		return [
			"s",
			q(this.options.HTMLAttributes, e),
			0
		];
	},
	markdownTokenName: "del",
	parseMarkdown: (e, t) => t.applyMark("strike", t.parseInline(e.tokens || [])),
	renderMarkdown: (e, t) => `~~${t.renderChildren(e)}~~`,
	addCommands() {
		return {
			setStrike: () => ({ commands: e }) => e.setMark(this.name),
			toggleStrike: () => ({ commands: e }) => e.toggleMark(this.name),
			unsetStrike: () => ({ commands: e }) => e.unsetMark(this.name)
		};
	},
	addKeyboardShortcuts() {
		return { "Mod-Shift-s": () => this.editor.commands.toggleStrike() };
	},
	addInputRules() {
		return [Rb({
			find: sT,
			type: this.type
		})];
	},
	addPasteRules() {
		return [Ub({
			find: cT,
			type: this.type
		})];
	}
}), uT = Hb.create({
	name: "text",
	group: "inline",
	parseMarkdown: (e) => ({
		type: "text",
		text: e.text || ""
	}),
	renderMarkdown: (e) => e.text || ""
}), dT = pb.create({
	name: "underline",
	addOptions() {
		return { HTMLAttributes: {} };
	},
	parseHTML() {
		return [{ tag: "u" }, {
			style: "text-decoration",
			consuming: !1,
			getAttrs: (e) => e.includes("underline") ? {} : !1
		}];
	},
	renderHTML({ HTMLAttributes: e }) {
		return [
			"u",
			q(this.options.HTMLAttributes, e),
			0
		];
	},
	parseMarkdown(e, t) {
		return t.applyMark(this.name || "underline", t.parseInline(e.tokens || []));
	},
	renderMarkdown(e, t) {
		return `<u>${t.renderChildren(e)}</u>`;
	},
	markdownTokenizer: {
		name: "underline",
		level: "inline",
		start(e) {
			return e.toLowerCase().indexOf("<u>");
		},
		tokenize(e, t, n) {
			if (!/^<u>/i.test(e)) return;
			let r = /\\[\s\S]|`+|<\/u>/gi;
			r.lastIndex = 3;
			let i = r.exec(e);
			for (; i;) {
				if (i[0].startsWith("`")) {
					let t = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/.exec(e.slice(i.index));
					t && (r.lastIndex = i.index + t[0].length);
				} else if (!i[0].startsWith("\\")) {
					let t = e.slice(3, i.index);
					return t ? {
						type: "underline",
						raw: e.slice(0, r.lastIndex),
						text: t,
						tokens: n.inlineTokens(t)
					} : void 0;
				}
				i = r.exec(e);
			}
		}
	},
	addCommands() {
		return {
			setUnderline: () => ({ commands: e }) => e.setMark(this.name),
			toggleUnderline: () => ({ commands: e }) => e.toggleMark(this.name),
			unsetUnderline: () => ({ commands: e }) => e.unsetMark(this.name)
		};
	},
	addKeyboardShortcuts() {
		return {
			"Mod-u": () => this.editor.commands.toggleUnderline(),
			"Mod-U": () => this.editor.commands.toggleUnderline()
		};
	}
});
// node_modules/prosemirror-dropcursor/dist/index.js
function fT(e = {}) {
	return new z({ view(t) {
		return new pT(t, e);
	} });
}
var pT = class {
	constructor(e, t) {
		this.editorView = e, this.cursorPos = null, this.element = null, this.timeout = -1, this.lastDragEvent = null, this.width = t.width ?? 1, this.color = t.color === !1 ? void 0 : t.color || "black", this.class = t.class, this.handlers = [
			"dragover",
			"dragend",
			"drop",
			"dragleave"
		].map((t) => {
			let n = (e) => {
				this[t](e);
			};
			return e.dom.addEventListener(t, n), {
				name: t,
				handler: n
			};
		});
	}
	destroy() {
		this.setCursor(null), this.handlers.forEach(({ name: e, handler: t }) => this.editorView.dom.removeEventListener(e, t));
	}
	update(e, t) {
		if (this.cursorPos != null && t.doc != e.state.doc) {
			if (this.lastDragEvent) {
				let e = this.computeTarget(this.lastDragEvent);
				e == this.cursorPos ? this.updateOverlay() : this.setCursor(e);
			} else this.updateOverlay();
		}
	}
	setCursor(e) {
		e != this.cursorPos && (this.cursorPos = e, e == null ? (this.element.parentNode.removeChild(this.element), this.element = null) : this.updateOverlay());
	}
	updateOverlay() {
		let e = this.editorView.state.doc.resolve(this.cursorPos), t = !e.parent.inlineContent, n, r = this.editorView.dom, i = r.getBoundingClientRect(), a = i.width / r.offsetWidth, o = i.height / r.offsetHeight;
		if (t) {
			let t = e.nodeBefore, r = e.nodeAfter;
			if (t || r) {
				let e = this.editorView.nodeDOM(this.cursorPos - (t ? t.nodeSize : 0));
				if (e) {
					let i = e.getBoundingClientRect(), a = t ? i.bottom : i.top;
					t && r && (a = (a + this.editorView.nodeDOM(this.cursorPos).getBoundingClientRect().top) / 2);
					let s = this.width / 2 * o;
					n = {
						left: i.left,
						right: i.right,
						top: a - s,
						bottom: a + s
					};
				}
			}
		}
		if (!n) {
			let e = this.editorView.coordsAtPos(this.cursorPos), t = this.width / 2 * a;
			n = {
				left: e.left - t,
				right: e.left + t,
				top: e.top,
				bottom: e.bottom
			};
		}
		let s = this.editorView.dom.offsetParent;
		this.element || (this.element = s.appendChild(document.createElement("div")), this.class && (this.element.className = this.class), this.element.style.cssText = "position: absolute; z-index: 50; pointer-events: none;", this.color && (this.element.style.backgroundColor = this.color)), this.element.classList.toggle("prosemirror-dropcursor-block", t), this.element.classList.toggle("prosemirror-dropcursor-inline", !t);
		let c, l;
		if (!s || s == document.body && getComputedStyle(s).position == "static") c = -pageXOffset, l = -pageYOffset;
		else {
			let e = s.getBoundingClientRect(), t = e.width / s.offsetWidth, n = e.height / s.offsetHeight;
			c = e.left - s.scrollLeft * t, l = e.top - s.scrollTop * n;
		}
		this.element.style.left = (n.left - c) / a + "px", this.element.style.top = (n.top - l) / o + "px", this.element.style.width = (n.right - n.left) / a + "px", this.element.style.height = (n.bottom - n.top) / o + "px";
	}
	scheduleRemoval(e) {
		clearTimeout(this.timeout), this.timeout = setTimeout(() => this.setCursor(null), e);
	}
	computeTarget(e) {
		let t = this.editorView.posAtCoords({
			left: e.clientX,
			top: e.clientY
		}), n = t && t.inside >= 0 && this.editorView.state.doc.nodeAt(t.inside), r = n && n.type.spec.disableDropCursor, i = typeof r == "function" ? r(this.editorView, t, e) : r;
		if (!t || i) return null;
		let a = t.pos;
		if (this.editorView.dragging && this.editorView.dragging.slice) {
			let e = kl(this.editorView.state.doc, a, this.editorView.dragging.slice);
			e != null && (a = e);
		}
		return a;
	}
	dragover(e) {
		if (!this.editorView.editable) return;
		this.lastDragEvent = e;
		let t = this.computeTarget(e);
		t != null && (this.setCursor(t), this.scheduleRemoval(5e3));
	}
	dragend() {
		this.scheduleRemoval(20);
	}
	drop() {
		this.scheduleRemoval(20);
	}
	dragleave(e) {
		this.editorView.dom.contains(e.relatedTarget) || this.setCursor(null);
	}
}, mT = class e extends I {
	constructor(e) {
		super(e, e);
	}
	map(t, n) {
		let r = t.resolve(n.map(this.head));
		return e.valid(r) ? new e(r) : I.near(r);
	}
	content() {
		return P.empty;
	}
	eq(t) {
		return t instanceof e && t.head == this.head;
	}
	toJSON() {
		return {
			type: "gapcursor",
			pos: this.head
		};
	}
	static fromJSON(t, n) {
		if (typeof n.pos != "number") throw RangeError("Invalid input for GapCursor.fromJSON");
		return new e(t.resolve(n.pos));
	}
	getBookmark() {
		return new hT(this.anchor);
	}
	static valid(e) {
		let t = e.parent;
		if (t.inlineContent || !_T(e) || !vT(e)) return !1;
		let n = t.type.spec.allowGapCursor;
		if (n != null) return n;
		let r = t.contentMatchAt(e.index()).defaultType;
		return r && r.isTextblock;
	}
	static findGapCursorFrom(t, n, r = !1) {
		search: for (;;) {
			if (!r && e.valid(t)) return t;
			let i = t.pos, a = null;
			for (let r = t.depth;; r--) {
				let o = t.node(r);
				if (n > 0 ? t.indexAfter(r) < o.childCount : t.index(r) > 0) {
					a = o.child(n > 0 ? t.indexAfter(r) : t.index(r) - 1);
					break;
				}
				if (r == 0) return null;
				i += n;
				let s = t.doc.resolve(i);
				if (e.valid(s)) return s;
			}
			for (;;) {
				let o = n > 0 ? a.firstChild : a.lastChild;
				if (!o) {
					if (a.isAtom && !a.isText && !R.isSelectable(a)) {
						t = t.doc.resolve(i + a.nodeSize * n), r = !1;
						continue search;
					}
					break;
				}
				a = o, i += n;
				let s = t.doc.resolve(i);
				if (e.valid(s)) return s;
			}
			return null;
		}
	}
};
mT.prototype.visible = !1, mT.findFrom = mT.findGapCursorFrom, I.jsonID("gapcursor", mT);
var hT = class e {
	constructor(e) {
		this.pos = e;
	}
	map(t) {
		return new e(t.map(this.pos));
	}
	resolve(e) {
		let t = e.resolve(this.pos);
		return mT.valid(t) ? new mT(t) : I.near(t);
	}
};
function gT(e) {
	return e.isAtom || e.spec.isolating || e.spec.createGapCursor;
}
function _T(e) {
	for (let t = e.depth; t >= 0; t--) {
		let n = e.index(t), r = e.node(t);
		if (n == 0) {
			if (r.type.spec.isolating) return !0;
		} else for (let e = r.child(n - 1);; e = e.lastChild) {
			if (e.childCount == 0 && !e.inlineContent || gT(e.type)) return !0;
			if (e.inlineContent) return !1;
		}
	}
	return !0;
}
function vT(e) {
	for (let t = e.depth; t >= 0; t--) {
		let n = e.indexAfter(t), r = e.node(t);
		if (n == r.childCount) {
			if (r.type.spec.isolating) return !0;
		} else for (let e = r.child(n);; e = e.firstChild) {
			if (e.childCount == 0 && !e.inlineContent || gT(e.type)) return !0;
			if (e.inlineContent) return !1;
		}
	}
	return !0;
}
function yT() {
	return new z({ props: {
		decorations: wT,
		createSelectionBetween(e, t, n) {
			return t.pos == n.pos && mT.valid(n) ? new mT(n) : null;
		},
		handleClick: ST,
		handleKeyDown: bT,
		handleDOMEvents: { beforeinput: CT }
	} });
}
var bT = Uh({
	ArrowLeft: xT("horiz", -1),
	ArrowRight: xT("horiz", 1),
	ArrowUp: xT("vert", -1),
	ArrowDown: xT("vert", 1)
});
function xT(e, t) {
	let n = e == "vert" ? t > 0 ? "down" : "up" : t > 0 ? "right" : "left";
	return function(e, r, i) {
		let a = e.selection, o = t > 0 ? a.$to : a.$from, s = a.empty;
		if (a instanceof L) {
			if (!i.endOfTextblock(n) || o.depth == 0) return !1;
			s = !1, o = e.doc.resolve(t > 0 ? o.after() : o.before());
		}
		let c = mT.findGapCursorFrom(o, t, s);
		return c ? (r && r(e.tr.setSelection(new mT(c))), !0) : !1;
	};
}
function ST(e, t, n) {
	if (!e || !e.editable) return !1;
	let r = e.state.doc.resolve(t);
	if (!mT.valid(r)) return !1;
	let i = e.posAtCoords({
		left: n.clientX,
		top: n.clientY
	});
	return i && i.inside > -1 && R.isSelectable(e.state.doc.nodeAt(i.inside)) ? !1 : (e.dispatch(e.state.tr.setSelection(new mT(r))), !0);
}
function CT(e, t) {
	if (t.inputType != "insertCompositionText" || !(e.state.selection instanceof mT)) return !1;
	let { $from: n } = e.state.selection, r = n.parent.contentMatchAt(n.index()).findWrapping(e.state.schema.nodes.text);
	if (!r) return !1;
	let i = M.empty;
	for (let e = r.length - 1; e >= 0; e--) i = M.from(r[e].createAndFill(null, i));
	let a = e.state.tr.replace(n.pos, n.pos, new P(i, 0, 0));
	return a.setSelection(L.near(a.doc.resolve(n.pos + 1))), e.dispatch(a), !1;
}
function wT(e) {
	if (!(e.selection instanceof mT)) return null;
	let t = document.createElement("div");
	return t.className = "ProseMirror-gapcursor", U.create(e.doc, [Wm.widget(e.selection.head, t, { key: "gapcursor" })]);
}
J.create({
	name: "characterCount",
	addOptions() {
		return {
			limit: null,
			autoTrim: !0,
			mode: "textSize",
			textCounter: (e) => e.length,
			wordCounter: (e) => e.split(" ").filter((e) => e !== "").length
		};
	},
	addStorage() {
		return {
			characters: () => 0,
			words: () => 0
		};
	},
	onBeforeCreate() {
		this.storage.characters = (e) => {
			let t = e?.node || this.editor.state.doc;
			if ((e?.mode || this.options.mode) === "textSize") {
				let e = t.textBetween(0, t.content.size, void 0, " ");
				return this.options.textCounter(e);
			}
			return t.nodeSize;
		}, this.storage.words = (e) => {
			let t = e?.node || this.editor.state.doc, n = t.textBetween(0, t.content.size, " ", " ");
			return this.options.wordCounter(n);
		};
	},
	addProseMirrorPlugins() {
		let e = !1;
		return [new z({
			key: new B("characterCount"),
			appendTransaction: (t, n, r) => {
				if (e) return;
				let i = this.options.limit, a = this.options.autoTrim;
				if (i == null || i === 0 || a === !1) {
					e = !0;
					return;
				}
				let o = this.storage.characters({ node: r.doc });
				if (o > i) {
					let t = o - i;
					console.warn(`[CharacterCount] Initial content exceeded limit of ${i} characters. Content was automatically trimmed.`);
					let n = r.tr.deleteRange(0, t);
					return e = !0, n;
				}
				e = !0;
			},
			filterTransaction: (e, t) => {
				let n = this.options.limit;
				if (!e.docChanged || n === 0 || n == null) return !0;
				let r = this.storage.characters({ node: t.doc }), i = this.storage.characters({ node: e.doc });
				if (i <= n || r > n && i > n && i <= r) return !0;
				if (r > n && i > n && i > r || !e.getMeta("paste")) return !1;
				let a = e.selection.$head.pos, o = a - (i - n), s = a;
				return e.deleteRange(o, s), !(this.storage.characters({ node: e.doc }) > n);
			}
		})];
	}
});
var TT = J.create({
	name: "dropCursor",
	addOptions() {
		return {
			color: "currentColor",
			width: 1,
			class: void 0
		};
	},
	addProseMirrorPlugins() {
		return [fT(this.options)];
	}
});
J.create({
	name: "focus",
	addOptions() {
		return {
			className: "has-focus",
			mode: "all"
		};
	},
	addProseMirrorPlugins() {
		return [new z({
			key: new B("focus"),
			props: { decorations: ({ doc: e, selection: t }) => {
				let { isEditable: n, isFocused: r } = this.editor, { anchor: i } = t, a = [];
				if (!n || !r) return U.create(e, []);
				let o = 0;
				this.options.mode === "deepest" && e.descendants((e, t) => {
					if (!e.isText) {
						if (!(i >= t && i <= t + e.nodeSize - 1)) return !1;
						o += 1;
					}
				});
				let s = 0;
				return e.descendants((e, t) => {
					if (e.isText || !(i >= t && i <= t + e.nodeSize - 1)) return !1;
					if (s += 1, this.options.mode === "deepest" && o - s > 0 || this.options.mode === "shallowest" && s > 1) return this.options.mode === "deepest";
					a.push(Wm.node(t, t + e.nodeSize, { class: this.options.className }));
				}), U.create(e, a);
			} }
		})];
	}
});
var ET = J.create({
	name: "gapCursor",
	addProseMirrorPlugins() {
		return [yT()];
	},
	extendNodeSchema(e) {
		return { allowGapCursor: K(G(e, "allowGapCursor", {
			name: e.name,
			options: e.options,
			storage: e.storage
		})) ?? null };
	}
}), DT = "placeholder", OT = new B("tiptap__placeholder");
function kT(e) {
	let { editor: t, placeholder: n, dataAttribute: r, pos: i, node: a, isEmptyDoc: o, hasAnchor: s, classes: { emptyNode: c, emptyEditor: l } } = e, u = [c];
	return o && u.push(l), Wm.node(i, i + a.nodeSize, {
		class: u.join(" "),
		[r]: typeof n == "function" ? n({
			editor: t,
			node: a,
			pos: i,
			hasAnchor: s
		}) : n
	});
}
function AT(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function jT({ editor: e, options: t, dataAttribute: n, doc: r, selection: i, from: a, to: o }) {
	let { anchor: s } = i, c = [], l = e.isEmpty;
	return r.nodesBetween(a, o, (r, i) => {
		let a = s >= i && s <= i + r.nodeSize, o = !r.isLeaf && jv(r);
		return r.type.isTextblock && (a || !t.showOnlyCurrent) && o && c.push(kT({
			editor: e,
			isEmptyDoc: l,
			dataAttribute: n,
			hasAnchor: a,
			placeholder: t.placeholder,
			classes: {
				emptyEditor: t.emptyEditorClass,
				emptyNode: AT(t.emptyNodeClass, {
					editor: e,
					node: r,
					pos: i,
					hasAnchor: a
				})
			},
			node: r,
			pos: i
		})), t.includeChildren;
	}), c;
}
function MT({ editor: e, options: t, dataAttribute: n, doc: r, selection: i }) {
	if (!e.isEditable && t.showOnlyWhenEditable) return null;
	let { anchor: a } = i, o = [], s = e.isEmpty;
	if (t.showOnlyCurrent && !t.includeChildren) {
		let i = r.resolve(a), c = i.depth > 0 ? i.node(1) : i.nodeAfter, l = i.depth > 0 ? i.before(1) : a;
		if (c && c.type.isTextblock && jv(c)) {
			let r = a >= l && a <= l + c.nodeSize;
			o.push(kT({
				editor: e,
				isEmptyDoc: s,
				dataAttribute: n,
				hasAnchor: r,
				placeholder: t.placeholder,
				classes: {
					emptyEditor: t.emptyEditorClass,
					emptyNode: AT(t.emptyNodeClass, {
						editor: e,
						node: c,
						pos: l,
						hasAnchor: r
					})
				},
				node: c,
				pos: l
			}));
		}
	} else o.push(...jT({
		editor: e,
		options: t,
		dataAttribute: n,
		doc: r,
		selection: i,
		from: 0,
		to: r.content.size
	}));
	return U.create(r, o);
}
function NT(e, t) {
	let n = e.resolve(t);
	if (n.depth === 0) {
		let e = n.nodeAfter ?? n.nodeBefore;
		if (!e) return {
			from: t,
			to: t
		};
		let r = n.nodeAfter ? t : t - e.nodeSize;
		return {
			from: r,
			to: r + e.nodeSize
		};
	}
	let r = n.before(1);
	return {
		from: r,
		to: r + n.node(1).nodeSize
	};
}
function PT(e, t) {
	return {
		from: Math.max(0, t.from),
		to: Math.min(e.content.size, t.to)
	};
}
function FT(e, t, n) {
	let r = [];
	return e.forEach((e, i) => {
		let a = i, o = a + e.nodeSize, s = a + 1, c = o + 1;
		s < n && c > t && r.push({
			from: a,
			to: o
		});
	}), r;
}
function IT(e) {
	if (e.length === 0) return [];
	let t = [...e].sort((e, t) => e.from - t.from), n = [{ ...t[0] }];
	for (let e = 1; e < t.length; e += 1) {
		let r = n[n.length - 1], i = t[e];
		i.from <= r.to ? r.to = Math.max(r.to, i.to) : n.push({ ...i });
	}
	return n;
}
function LT(e, t) {
	let n = FT(e, t.from, t.to);
	return n.push(PT(e, NT(e, t.from))), t.to > t.from ? n.push(PT(e, NT(e, Math.min(t.to, e.content.size + 1) - 1))) : t.from < e.content.size + 1 && n.push(PT(e, NT(e, Math.min(t.from + 1, e.content.size)))), n;
}
function RT(e, t, n) {
	let r = [];
	if (e.docChanged) {
		let t = vv(e);
		for (let e of t) r.push(...LT(n.doc, e.newRange));
	}
	return e.selectionSet && (r.push(PT(n.doc, NT(n.doc, e.mapping.map(t.selection.anchor)))), r.push(PT(n.doc, NT(n.doc, n.selection.anchor)))), IT(r);
}
function zT(e, t, n) {
	let r = Math.max(0, Math.min(e, n.content.size));
	return {
		from: r,
		to: Math.max(r, Math.min(t, n.content.size))
	};
}
function BT({ decorations: e, ranges: t, editor: n, options: r, dataAttribute: i, doc: a, selection: o }) {
	let s = e;
	for (let e of t) {
		let { from: t, to: c } = zT(e.from, e.to, a), l = s.find(t, c).filter((e) => e.from >= t && e.to <= c);
		l.length && (s = s.remove(l));
		let u = jT({
			editor: n,
			options: r,
			dataAttribute: i,
			doc: a,
			selection: o,
			from: t,
			to: c
		});
		u.length && (s = s.add(a, u));
	}
	return s;
}
function VT({ editor: e, options: t, dataAttribute: n }) {
	return {
		init(r, i) {
			return MT({
				editor: e,
				options: t,
				dataAttribute: n,
				doc: i.doc,
				selection: i.selection
			}) ?? U.empty;
		},
		apply(r, i, a, o) {
			return !r.docChanged && !r.selectionSet ? i : BT({
				decorations: i.map(r.mapping, r.doc),
				ranges: RT(r, a, o),
				editor: e,
				options: t,
				dataAttribute: n,
				doc: o.doc,
				selection: o.selection
			});
		}
	};
}
function HT(e) {
	return e.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").replace(/^[0-9-]+/, "").replace(/^-+/, "").toLowerCase();
}
function UT({ editor: e, options: t }) {
	let n = t.dataAttribute ? `data-${HT(t.dataAttribute)}` : `data-${DT}`, r = t.showOnlyCurrent && !t.includeChildren;
	return new z({
		key: OT,
		...r ? {} : { state: VT({
			editor: e,
			options: t,
			dataAttribute: n
		}) },
		props: { decorations: r ? ({ doc: r, selection: i }) => MT({
			editor: e,
			options: t,
			dataAttribute: n,
			doc: r,
			selection: i
		}) : (n) => t.showOnlyWhenEditable && !e.isEditable ? U.empty : OT.getState(n) ?? U.empty }
	});
}
J.create({
	name: "placeholder",
	addOptions() {
		return {
			emptyEditorClass: "is-editor-empty",
			emptyNodeClass: "is-empty",
			dataAttribute: DT,
			placeholder: "Write something …",
			showOnlyWhenEditable: !0,
			showOnlyCurrent: !0,
			includeChildren: !1
		};
	},
	addProseMirrorPlugins() {
		return [UT({
			editor: this.editor,
			options: this.options
		})];
	}
});
function WT(e, t) {
	return !e.selection.empty && !Mv(e.selection) && t.isEditable;
}
function GT(e, t) {
	return WT(e, t) && !t.isFocused && !t.view.dragging;
}
function KT() {
	var e;
	(e = window.getSelection()) == null || e.removeAllRanges();
}
function qT(e) {
	e.focus();
}
J.create({
	name: "selection",
	addOptions() {
		return { className: "selection" };
	},
	addProseMirrorPlugins() {
		let { editor: e, options: t } = this;
		return [new z({
			key: new B("selection"),
			props: {
				decorations(n) {
					return GT(n, e) ? U.create(n.doc, [Wm.inline(n.selection.from, n.selection.to, { class: t.className })]) : null;
				},
				handleDOMEvents: {
					blur(t) {
						return WT(t.state, e) && KT(), !1;
					},
					focus(t) {
						return WT(t.state, e) && requestAnimationFrame(() => {
							!e.isDestroyed && t.hasFocus() && qT(t);
						}), !1;
					}
				}
			}
		})];
	}
});
function JT({ types: e, node: t }) {
	return t && Array.isArray(e) && e.includes(t.type) || t?.type === e;
}
var YT = J.create({
	name: "trailingNode",
	addOptions() {
		return {
			node: void 0,
			notAfter: []
		};
	},
	addProseMirrorPlugins() {
		let e = new B(this.name), t = this.options.node || this.editor.schema.topNodeType.contentMatch.defaultType?.name || "paragraph", n = Object.entries(this.editor.schema.nodes).map(([, e]) => e).filter((e) => (this.options.notAfter || []).concat(t).includes(e.name));
		return [new z({
			key: e,
			appendTransaction: (n, r, i) => {
				let { doc: a, tr: o, schema: s } = i, c = e.getState(i), l = a.content.size, u = s.nodes[t];
				if (!n.some((e) => e.getMeta("skipTrailingNode")) && c) return o.insert(l, u.create());
			},
			state: {
				init: (e, t) => {
					let r = t.tr.doc.lastChild;
					return !JT({
						node: r,
						types: n
					});
				},
				apply: (e, t) => {
					if (!e.docChanged || e.getMeta("__uniqueIDTransaction")) return t;
					let r = e.doc.lastChild;
					return !JT({
						node: r,
						types: n
					});
				}
			}
		})];
	}
}), XT = J.create({
	name: "undoRedo",
	addOptions() {
		return {
			depth: 100,
			newGroupDelay: 500
		};
	},
	addCommands() {
		return {
			undo: () => ({ state: e, dispatch: t }) => mg(e, t),
			redo: () => ({ state: e, dispatch: t }) => hg(e, t)
		};
	},
	addProseMirrorPlugins() {
		return [fg(this.options)];
	},
	addKeyboardShortcuts() {
		return {
			"Mod-z": () => this.editor.commands.undo(),
			"Shift-Mod-z": () => this.editor.commands.redo(),
			"Mod-y": () => this.editor.commands.redo(),
			"Mod-я": () => this.editor.commands.undo(),
			"Shift-Mod-я": () => this.editor.commands.redo()
		};
	}
}), ZT = J.create({
	name: "starterKit",
	addExtensions() {
		let e = [];
		return this.options.bold !== !1 && e.push(ix.configure(this.options.bold)), this.options.blockquote !== !1 && e.push($b.configure(this.options.blockquote)), this.options.bulletList !== !1 && e.push(YC.configure(this.options.bulletList)), this.options.code !== !1 && e.push(cx.configure(this.options.code)), this.options.codeBlock !== !1 && e.push(fx.configure(this.options.codeBlock)), this.options.document !== !1 && e.push(px.configure(this.options.document)), this.options.dropcursor !== !1 && e.push(TT.configure(this.options.dropcursor)), this.options.gapcursor !== !1 && e.push(ET.configure(this.options.gapcursor)), this.options.hardBreak !== !1 && e.push(mx.configure(this.options.hardBreak)), this.options.heading !== !1 && e.push(hx.configure(this.options.heading)), this.options.undoRedo !== !1 && e.push(XT.configure(this.options.undoRedo)), this.options.horizontalRule !== !1 && e.push(gx.configure(this.options.horizontalRule)), this.options.italic !== !1 && e.push(xx.configure(this.options.italic)), this.options.listItem !== !1 && e.push(Cw.configure(this.options.listItem)), this.options.listKeymap !== !1 && e.push(Mw.configure(this.options?.listKeymap)), this.options.link !== !1 && e.push(GC.configure(this.options?.link)), this.options.orderedList !== !1 && e.push(Qw.configure(this.options.orderedList)), this.options.paragraph !== !1 && e.push(oT.configure(this.options.paragraph)), this.options.strike !== !1 && e.push(lT.configure(this.options.strike)), this.options.text !== !1 && e.push(uT.configure(this.options.text)), this.options.underline !== !1 && e.push(dT.configure(this.options?.underline)), this.options.trailingNode !== !1 && e.push(YT.configure(this.options?.trailingNode)), e;
	}
}), QT = () => {
	let e = !0;
	return (t, n) => {
		if (e) {
			e = !1;
			try {
				t();
			} finally {
				e = !0;
			}
		} else n !== void 0 && n();
	};
}, $T = (e, t) => e >>> t | e << 32 - t, eE = (e) => $T(e, 2) ^ $T(e, 13) ^ $T(e, 22), tE = (e) => $T(e, 6) ^ $T(e, 11) ^ $T(e, 25), nE = (e) => $T(e, 7) ^ $T(e, 18) ^ e >>> 3, rE = (e) => $T(e, 17) ^ $T(e, 19) ^ e >>> 10, iE = new Uint32Array([
	1116352408,
	1899447441,
	3049323471,
	3921009573,
	961987163,
	1508970993,
	2453635748,
	2870763221,
	3624381080,
	310598401,
	607225278,
	1426881987,
	1925078388,
	2162078206,
	2614888103,
	3248222580,
	3835390401,
	4022224774,
	264347078,
	604807628,
	770255983,
	1249150122,
	1555081692,
	1996064986,
	2554220882,
	2821834349,
	2952996808,
	3210313671,
	3336571891,
	3584528711,
	113926993,
	338241895,
	666307205,
	773529912,
	1294757372,
	1396182291,
	1695183700,
	1986661051,
	2177026350,
	2456956037,
	2730485921,
	2820302411,
	3259730800,
	3345764771,
	3516065817,
	3600352804,
	4094571909,
	275423344,
	430227734,
	506948616,
	659060556,
	883997877,
	958139571,
	1322822218,
	1537002063,
	1747873779,
	1955562222,
	2024104815,
	2227730452,
	2361852424,
	2428436474,
	2756734187,
	3204031479,
	3329325298
]), aE = new Uint32Array([
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
]), oE = class {
	constructor() {
		let e = /* @__PURE__ */ new ArrayBuffer(320);
		this._H = new Uint32Array(e, 0, 8), this._H.set(aE), this._W = new Uint32Array(e, 64, 64);
	}
	_updateHash() {
		let e = this._H, t = this._W;
		for (let e = 16; e < 64; e++) t[e] = rE(t[e - 2]) + t[e - 7] + nE(t[e - 15]) + t[e - 16];
		let n = e[0], r = e[1], i = e[2], a = e[3], o = e[4], s = e[5], c = e[6], l = e[7];
		for (let e = 0, u, d; e < 64; e++) u = l + tE(o) + (o & s ^ ~o & c) + iE[e] + t[e] >>> 0, d = eE(n) + (n & r ^ n & i ^ r & i) >>> 0, l = c, c = s, s = o, o = a + u >>> 0, a = i, i = r, r = n, n = u + d >>> 0;
		e[0] += n, e[1] += r, e[2] += i, e[3] += a, e[4] += o, e[5] += s, e[6] += c, e[7] += l;
	}
	digest(e) {
		let t = 0;
		for (; t + 56 <= e.length;) {
			let n = 0;
			for (; n < 16 && t + 3 < e.length; n++) this._W[n] = e[t++] << 24 | e[t++] << 16 | e[t++] << 8 | e[t++];
			if (t % 64 != 0) {
				for (this._W.fill(0, n, 16); t < e.length;) this._W[n] |= e[t] << (3 - t % 4) * 8, t++;
				this._W[n] |= 128 << (3 - t % 4) * 8;
			}
			this._updateHash();
		}
		let n = t % 64 != 0;
		this._W.fill(0, 0, 16);
		let r = 0;
		for (; t < e.length; r++) for (let n = 3; n >= 0 && t < e.length; n--) this._W[r] |= e[t++] << n * 8;
		n || (this._W[r - (t % 4 == 0 ? 0 : 1)] |= 128 << (3 - t % 4) * 8), this._W[14] = e.byteLength / te, this._W[15] = e.byteLength * 8, this._updateHash();
		let i = /* @__PURE__ */ new Uint8Array(32);
		for (let e = 0; e < this._H.length; e++) for (let t = 0; t < 4; t++) i[e * 4 + t] = this._H[e] >>> (3 - t) * 8;
		return i;
	}
}, sE = (e) => new oE().digest(e), cE = /[\uD800-\uDBFF]/, lE = /[\uDC00-\uDFFF]/, uE = (e, t) => {
	let n = 0, r = 0;
	for (; n < e.length && n < t.length && e[n] === t[n];) n++;
	for (n > 0 && cE.test(e[n - 1]) && n--; r + n < e.length && r + n < t.length && e[e.length - r - 1] === t[t.length - r - 1];) r++;
	return r > 0 && lE.test(e[e.length - r]) && r--, {
		index: n,
		remove: e.length - n - r,
		insert: t.slice(n, t.length - r)
	};
};
// node_modules/@tiptap/y-tiptap/dist/index.js
function dE(e) {
	if (!e || !(e.content instanceof Yo)) return null;
	let t = e.content.type;
	if (!(t instanceof fo || t instanceof co || t instanceof go)) throw Error("Expected a Yjs XML type");
	return t;
}
function fE(e) {
	if (e === null) return null;
	if (!(e.parent instanceof k)) throw Error("Expected an integrated Yjs parent");
	let t = e.parent;
	if (!(t instanceof fo || t instanceof co || t instanceof go)) throw Error("Expected a Yjs XML type");
	return t;
}
var pE = (e, t) => {
	let n = null, r = null;
	return e._item === null ? r = vi(e) : n = E(e._item.id.client, e._item.id.clock), new bi(n, r, t.id);
}, mE = (e, t, n) => {
	if (e === 0) return wi(t, 0, -1);
	let r = dE(t._first);
	for (; r !== null && t !== r;) {
		if (r instanceof vo) {
			if (r._length >= e) return wi(r, e, -1);
			if (e -= r._length, r._item !== null && r._item.next !== null) r = dE(r._item.next);
			else {
				do
					r = fE(r._item), e--;
				while (r !== t && r !== null && r._item !== null && r._item.next === null);
				r !== null && r !== t && (r = r._item === null ? null : dE(r._item.next));
			}
		} else {
			let i = n.get(r), a = i instanceof Rs ? i.nodeSize : 0;
			if (r._first !== null && e < a) r = dE(r._first), e--;
			else {
				if (e === 1 && r._length === 0 && a > 1) return new bi(r._item === null ? null : r._item.id, r._item === null ? vi(r) : null, null);
				if (e -= a, r._item !== null && r._item.next !== null) r = dE(r._item.next);
				else {
					if (e === 0) {
						if (r = r._item === null ? r : fE(r._item), r === null) throw S();
						return new bi(r._item === null ? null : r._item.id, r._item === null ? vi(r) : null, null);
					}
					do {
						if (r = fE(r._item), r === null) throw S();
						e--;
					} while (r !== t && r._item?.next === null);
					r !== t && (r = dE(r._item?.next));
				}
			}
		}
		if (r === null) throw S();
		if (e === 0 && r.constructor !== vo && r !== t) {
			let e = r._item, t = fE(e);
			if (e === null || t === null) throw S();
			return pE(t, e);
		}
	}
	return wi(t, t._length, -1);
};
function hE(e, t) {
	if (e instanceof vo) return e._length;
	let n = t.get(e);
	return n instanceof Rs ? n.nodeSize : null;
}
function gE(e, t, n) {
	let r = 0, i = e._first;
	for (; i !== null;) {
		let e = dE(i);
		if (e === t) break;
		let a = i.deleted;
		if (i = i.right, a) continue;
		if (e === null) return null;
		let o = hE(e, n);
		if (o === null) return null;
		r += o;
	}
	return r;
}
function _E(e, t, n) {
	let r = 0, i = 0, a = e._first;
	for (; i < e._length && i < t && a !== null;) {
		let e = a;
		if (a = a.right, e.deleted) continue;
		let t = dE(e);
		if (t === null) return null;
		let o = hE(t, n);
		if (o === null) return null;
		i++, r += o;
	}
	return r;
}
var vE = (e, t, n) => {
	if (n === null) return !1;
	let r = Ei(t, e);
	return r !== null && r.type instanceof vo && t.item !== null && r.type._item?.deleted === !0;
}, yE = (e, t, n, r) => {
	let i = Ei(n, e);
	if (i === null || i.type !== t && !yi(t, i.type._item)) return null;
	let a = i.type, o = 0;
	if (a.constructor === vo) o = i.index;
	else if (!a._item?.deleted) {
		let e = _E(a, i.index, r);
		if (e === null) return null;
		o = e + 1;
	}
	for (; a !== t && a._item !== null;) {
		let e = fE(a._item);
		if (e === null) return null;
		if (e._item?.deleted) {
			a = e;
			continue;
		}
		let t = gE(e, a, r);
		if (t === null) return null;
		o += t + 1, a = e;
	}
	let s = o - 1;
	return vE(e, n, s) ? null : s;
}, $ = new B("y-sync"), bE = new B("y-undo");
new B("yjs-cursor");
function xE(e) {
	let t = $.getState(e);
	if (!t) throw Error("The editor requires ySyncPlugin");
	return t;
}
var SE = (e, t) => t === void 0 ? !e.deleted : t.sv.has(e.id.client) && (t.sv.get(e.id.client) ?? 0) > e.id.clock && !Rr(t.ds, e.id), CE = (e, t, n) => {
	if (!e.has(n)) {
		if (e.size < t.length) {
			let n = a();
			e.forEach((e) => n.add(e)), t = t.filter((e) => !n.has(e));
		}
		e.set(n, ut(t));
	}
	let r = e.get(n);
	if (!r) throw Error("At least one snapshot color is required");
	return r;
}, wE = (e, t) => {
	if (e === t) return !0;
	let n = Object.keys(e);
	return n.length === Object.keys(t).length && n.every((n) => e[n] === t[n]);
}, TE = (e) => {
	let t = e.type.spec.attrs || {};
	return Object.keys(e.attrs).some((n) => {
		let r = t[n];
		return r == null || !Object.prototype.hasOwnProperty.call(r, "default") || r.default !== e.attrs[n];
	});
}, EE = (e, t, n) => {
	let r = 0, i = 0;
	for (; i < e.childCount; i++) {
		let t = e.child(i);
		if (r + t.nodeSize > n) break;
		r += t.nodeSize;
	}
	if (i >= e.childCount) return null;
	let a = e.child(i), o = e.resolve(n), s = (e, t) => {
		if (o.depth === 0) {
			let i = e + (n - r), a = e + 1, o = e + t.nodeSize - 1;
			return Math.max(a, Math.min(i, o));
		}
		if (o.depth > 1) {
			let n = EE(o.node(1), t, o.pos - o.start(1));
			return n === null ? null : e + 1 + n;
		}
		return t.isTextblock ? e + 1 + Math.min(o.parentOffset, t.content.size) : null;
	}, c = (n, r = !1) => {
		let a = 0;
		for (let t = 0; t <= i; t++) n(e.child(t)) && a++;
		let o = 0, c = -1, l = null, u = 0;
		for (let e = 0; e < t.childCount; e++) {
			let r = t.child(e);
			n(r) && (o++, o === a && (c = u, l = r)), u += r.nodeSize;
		}
		return l === null || r && (a !== 1 || o !== 1) ? null : s(c, l);
	}, l = (e) => e.type === a.type && wE(e.attrs, a.attrs), u = a.textContent, d = c((e) => l(e) && e.textContent === u);
	if (d !== null) return d;
	let f = c((e) => e.type === a.type && e.textContent === u);
	if (f !== null) return f;
	if (!a.isTextblock || TE(a)) {
		let e = c(l, !0);
		if (e !== null) return e;
	}
	return c((e) => l(e) && u !== "" && e.textContent !== "" && (u.startsWith(e.textContent) || e.textContent.startsWith(u)), !0);
}, DE = (e, t, n, r) => {
	if (r === null) return !1;
	let i = e.resolve(n), a = t.resolve(r);
	if (!i.parent.isTextblock) return !1;
	if (!a.parent.isTextblock || i.parent.textContent !== a.parent.textContent || i.parentOffset !== 0 && a.parentOffset === 0) return !0;
	let o = i.parentOffset === 0 && a.parentOffset === 0, s = i.parentOffset !== a.parentOffset || i.parent.type !== a.parent.type || !wE(i.parent.attrs, a.parent.attrs);
	if (o || s) {
		let i = EE(e, t, n);
		return i !== null && i !== r;
	}
	return !1;
}, OE = (e, t, n, r) => {
	if (n == null || n < 0 || n > t.content.size || !(r === null || n > 1 && r <= 1 || DE(t, e, n, r))) return r;
	let i = EE(t, e, n);
	return i === null ? r : i;
}, kE = (e, t, n, r) => {
	if (t !== null && t.anchor !== null && t.head !== null) {
		if (t.type === "all") e.setSelection(new nu(e.doc));
		else if (t.type === "node") {
			let r = yE(n.doc, n.type, t.anchor, n.mapping);
			r !== null && e.setSelection(AE(e, r));
		} else if (t.type === "nodeRange") {
			let r = jE(e, yE(n.doc, n.type, t.anchor, n.mapping), yE(n.doc, n.type, t.head, n.mapping), t.depth);
			r !== null && e.setSelection(r);
		} else {
			let i = yE(n.doc, n.type, t.anchor, n.mapping), a = yE(n.doc, n.type, t.head, n.mapping);
			r != null && (i = OE(e.doc, r, t.absAnchor, i), a = OE(e.doc, r, t.absHead, a)), i === null && (i = a), a === null && (a = i), i !== null && a !== null && e.setSelection(L.between(e.doc.resolve(i), e.doc.resolve(a)));
		}
	}
}, AE = (e, t) => {
	let n = e.doc.resolve(t);
	return n.nodeAfter ? R.create(e.doc, t) : L.near(n);
}, jE = (e, t, n, r) => {
	if (t === null || n === null) return null;
	let i = Math.min(Math.max(t, 0), e.doc.content.size), a = Math.min(Math.max(n, 0), e.doc.content.size);
	try {
		let t = I.fromJSON(e.doc, {
			type: "nodeRange",
			anchor: i,
			head: a,
			depth: r
		});
		return t.ranges.length ? t : L.near(e.doc.resolve(i));
	} catch {
		return L.near(e.doc.resolve(i));
	}
}, ME = (e, t) => {
	let n = t.selection, r = n.toJSON(), i = typeof r.type == "string" ? r.type : "text";
	return {
		type: i,
		depth: i === "nodeRange" && "depth" in n && typeof n.depth == "number" ? n.depth : void 0,
		anchor: mE(t.selection.anchor, e.type, e.mapping),
		head: mE(t.selection.head, e.type, e.mapping),
		absAnchor: t.selection.anchor,
		absHead: t.selection.head
	};
}, NE = /* @__PURE__ */ new WeakMap(), PE = (e, t) => {
	var n;
	(t instanceof fo || t instanceof co || t instanceof go) && (e.delete(t), (n = NE.get(e)) == null || n.delete(t));
}, FE = (e, t, n) => t === void 0 || n === void 0 || e._item === null || SE(e._item, t) ? t : SE(e._item, n) ? n : void 0, IE = (e, t, n) => {
	let r = e.toDelta(t);
	if (r.some((e) => typeof e.insert != "string")) return r;
	let i = e.toDelta(ki, t, n), a = [], o = 0, s = 0;
	for (let e of r) {
		let t = 0;
		for (; t < e.insert.length;) {
			let n = i[o], r = Math.min(e.insert.length - t, n.insert.length - s);
			a.push({
				insert: e.insert.slice(t, t + r),
				attributes: {
					...e.attributes,
					ychange: n.attributes?.ychange ?? { type: "removed" }
				}
			}), t += r, s += r, s === n.insert.length && (o += 1, s = 0);
		}
	}
	return a;
}, LE = /(.*)(--[a-zA-Z0-9+/=]{8})$/, RE = (e) => LE.exec(e)?.[1] ?? e, zE = (e, t) => {
	let n = [];
	for (let r in e) n.push(t.mark(RE(r), e[r]));
	return n;
}, BE = (e) => {
	let t = e.doc, n = e._item;
	if (!t || !n) throw S();
	t.transact((e) => {
		n.delete(e);
	}, $);
}, VE = (e) => e instanceof Error ? e : Error(String(e)), HE = (e, t, n, r, i, a) => {
	let o = FE(e, r, i), s = o !== r && o !== void 0 ? IE(e, o, a) : e.toDelta(r, i, a);
	try {
		return s.map((e) => {
			if (typeof e.insert != "string") throw Error("Cannot project a Yjs text embed");
			return t.text(e.insert, zE(e.attributes, t));
		});
	} catch (t) {
		return n.reportInvalidContent ? n.reportInvalidContent(VE(t)) : BE(e), null;
	}
}, UE = (e) => {
	var t;
	let n = (t = e._item) == null || (t = t.right) == null ? void 0 : t.content, r = n instanceof Yo ? n.type : null;
	if (!(r instanceof co)) return;
	let i = r._item, a = r.doc;
	i && a && !i.deleted && i.id.client === a.clientID && (e.applyDelta([{ retain: e.length }, ...r.toDelta()]), a.transact((e) => {
		i.delete(e);
	}));
}, WE = (e, t, n) => t !== void 0 && n !== void 0 && e._item !== null && !SE(e._item, t) && !SE(e._item, n), GE = (e, t, n, r) => t === void 0 || n === void 0 ? e.toArray() : r === t ? Ca(e, new Di(n.ds, t.sv)) : r === void 0 ? e.toArray() : Ca(e, r), KE = (e, t, n, r) => {
	if (e._item) {
		if (!SE(e._item, t)) return r ? r("removed", e._item.id) : { type: "removed" };
		if (!SE(e._item, n)) return r ? r("added", e._item.id) : { type: "added" };
	}
}, qE = (e, t, n) => {
	e.mapping.set(t, n);
	let r = NE.get(e.mapping);
	r === void 0 && (r = /* @__PURE__ */ new WeakMap(), NE.set(e.mapping, r)), r.set(t, n);
}, JE = (e, t, n, r, i, a) => {
	let o = n.mapping.get(e), s = Array.isArray(o) ? void 0 : o;
	if (s !== void 0 && NE.get(n.mapping)?.get(e) === s) return s;
	let c = FE(e, r, i), l = [], u = !1;
	GE(e, r, i, c).forEach((e) => {
		if (WE(e, r, i)) return;
		if (e instanceof A) {
			let o = JE(e, t, n, r, i, a);
			(o === null || n.mapping.get(e) !== o) && (u = !0), o !== null && l.push(o);
			return;
		}
		if (!(e instanceof vo)) return;
		n.deferTextMerge ? n.deferTextMerge(e) : UE(e);
		let o = HE(e, t, n, r, i, a);
		o === null && (u = !0), o?.forEach((e) => l.push(e));
	});
	try {
		let o = e.getAttributes(c), d = r ? KE(e, r, i, a) : void 0;
		d !== void 0 && (o.ychange = d);
		let f = t.node(e.nodeName, o, l);
		return s?.eq(f) && (f = s), u && n.reportInvalidContent ? (PE(n.mapping, e), f) : (qE(n, e, f), f);
	} catch (t) {
		return PE(n.mapping, e), n.reportInvalidContent ? (n.reportInvalidContent(VE(t)), null) : (BE(e), null);
	}
}, YE = (e) => {
	for (let t = 6; t < e.length; t++) e[t % 6] = e[t % 6] ^ e[t];
	return e.slice(0, 6);
}, XE = (e) => Gt(YE(sE(qt(e)))), ZE = (e, t) => {
	let r = {};
	return e.forEach((e) => {
		if (e.type.name !== "ychange") {
			let i = n(t.isOMark, e.type, () => !e.type.excludes(e.type));
			r[i ? `${e.type.name}--${XE(e.toJSON())}` : e.type.name] = e.attrs;
		}
	}), r;
}, QE = (e, t) => {
	let n = new vo(), r = e.map((e) => ({
		insert: e.text ?? "",
		attributes: ZE(e.marks, t)
	}));
	return n.applyDelta(r), t.mapping.set(n, e), n;
}, $E = (e) => {
	let t = e.content.content, n = [];
	for (let e = 0; e < t.length; e++) {
		let r = t[e];
		if (r.isText) {
			let r = [];
			for (let n = t[e]; e < t.length && n.isText; n = t[++e]) r.push(n);
			e--, n.push(r);
		} else n.push(r);
	}
	return n;
}, eD = (e, t) => e instanceof Array ? QE(e, t) : tD(e, t), tD = (e, t) => {
	let n = new A(e.type.name);
	for (let t in e.attrs) {
		let r = e.attrs[t];
		r !== null && t !== "ychange" && n.setAttribute(t, r);
	}
	return n.insert(0, $E(e).map((e) => eD(e, t))), t.mapping.set(n, e), n;
}, nD = (e) => typeof e == "object" && !!e, rD = (e, t) => {
	let n = Object.keys(e).filter((t) => e[t] !== null), r = n.length === Object.keys(t).filter((e) => t[e] !== null).length;
	for (let i = 0; i < n.length && r; i++) {
		let a = n[i], o = e[a], s = t[a];
		r = a === "ychange" || o === s || nD(o) && nD(s) && rD(o, s);
	}
	return r;
}, iD = (e, t) => {
	let n = e.toDelta();
	return n.length === t.length && n.every((e, n) => e.insert === t[n].text && St(e.attributes || {}).length === t[n].marks.length && Object.entries(e.attributes ?? {}).every(([e, r]) => {
		let i = RE(e), a = t[n].marks.find((e) => e.type.name === i);
		return a ? rD(r, a.attrs) : !1;
	}));
}, aD = (e, t) => e === t || e instanceof Array && t instanceof Array && e.length === t.length && e.every((e, n) => t[n] === e), oD = (e, t) => !(t instanceof Array) && e.nodeName === t.type.name, sD = (e, t, n) => {
	if (e instanceof A && !(t instanceof Array) && oD(e, t)) {
		let r = $E(t);
		return e._length === r.length && rD(e.getAttributes(), t.attrs) && e.toArray().every((e, t) => aD(n?.get(e), r[t]) || sD(e, r[t], n));
	}
	return e instanceof vo && t instanceof Array && iD(e, t);
}, cD = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	t.forEach((e, t) => {
		r.has(e) || r.set(e, t);
	});
	let i = [];
	if (e.forEach((e, a) => {
		let o = n.mapping.get(e), s = o === void 0 ? void 0 : r.get(o);
		s !== void 0 && aD(o, t[s]) && i.push({
			yIndex: a,
			pIndex: s,
			yChild: e
		});
	}), i.length === 0) return [];
	let a = [], o = [];
	for (let e = 0; e < i.length; e++) {
		let t = 0, n = o.length;
		for (; t < n;) {
			let r = t + n >> 1;
			i[o[r]].pIndex < i[e].pIndex ? t = r + 1 : n = r;
		}
		a[e] = t > 0 ? o[t - 1] : -1, o[t] = e;
	}
	let s = [];
	for (let e = o[o.length - 1]; e !== -1; e = a[e]) s.push(i[e]);
	return s.reverse();
}, lD = (e) => {
	let t = "", n = e._start, r = {};
	for (; n !== null;) n.deleted || (n.countable && n.content instanceof zo ? t += n.content.str : n.content instanceof Mo && (r[n.content.key] = null)), n = n.right;
	return {
		str: t,
		nAttrs: r
	};
}, uD = (e, t, n) => {
	n.mapping.set(e, t);
	let { nAttrs: r, str: i } = lD(e), a = t.map((e) => ({
		insert: e.text ?? "",
		attributes: Object.assign({}, r, ZE(e.marks, n))
	})), { insert: o, remove: s, index: c } = uE(i, a.map((e) => e.insert).join(""));
	e.delete(c, s), e.insert(c, o), e.applyDelta(a.map((e) => ({
		retain: e.insert.length,
		attributes: e.attributes
	})));
}, dD = (e, t, n, r, i) => t instanceof vo && n instanceof Array ? (iD(t, n) ? r.mapping.set(t, n) : uD(t, n, r), !0) : t instanceof A && !(n instanceof Array) && oD(t, n) ? (sD(t, n, r.mapping) ? r.mapping.set(t, n) : i(e, t, n, r), !0) : !1, fD = (e, t, n, r) => {
	n > 0 && (e.slice(t, t + n).forEach((e) => PE(r.mapping, e)), e.delete(t, n));
}, pD = (e, t, n, r, i, a) => {
	if (r < i) {
		let o = [];
		for (let e = r; e < i; e++) o.push(eD(n[e], a));
		e.insert(t, o);
	}
}, mD = (e, t, n, r, i, a, o, s, c, l) => {
	let u = g(a - i, s - o);
	for (let a = 0; a < u; a++) {
		let s = r[i + a], u = n[o + a];
		dD(e, s, u, c, l) || (fD(t, o + a, 1, c), pD(t, o + a, n, o + a, o + a + 1, c));
	}
	fD(t, o + u, a - i - u, c), pD(t, o + u, n, o + u, s, c);
}, hD = (e, t, n, r, i, a) => {
	let o = cD(r, n, i);
	if (o.length < 2 || !o.some((e) => e.yIndex !== e.pIndex) || o.some((e) => {
		let t = n[e.pIndex];
		return !(e.yChild instanceof vo && t instanceof Array || e.yChild instanceof A && !(t instanceof Array));
	})) return !1;
	let s = 0, c = 0;
	for (let l of o) {
		mD(e, t, n, r, s, l.yIndex, c, l.pIndex, i, a);
		let o = n[l.pIndex];
		dD(e, l.yChild, o, i, a), s = l.yIndex + 1, c = l.pIndex + 1;
	}
	return mD(e, t, n, r, s, r.length, c, n.length, i, a), !0;
}, gD = (e, t, n) => {
	let r = e.toArray(), i = $E(t), a = i.length, o = r.length, s = g(o, a), c = 0, l = 0, u = !1;
	for (; c < s; c++) {
		let e = r[c], t = i[c];
		if (aD(n.mapping.get(e), t)) u = !0;
		else if (!sD(e, t, n.mapping)) break;
	}
	for (; c + l < s; l++) {
		let e = r[o - l - 1], t = i[a - l - 1];
		if (aD(n.mapping.get(e), t)) u = !0;
		else if (!sD(e, t, n.mapping)) break;
	}
	return {
		equalityFactor: c + l,
		foundMappedChild: u
	};
}, _D = (e, t, n, r) => {
	if (t instanceof A && t.nodeName !== n.type.name) throw Error("node name mismatch!");
	if (r.mapping.set(t, n), t instanceof A) {
		let e = t.getAttributes(), r = n.attrs;
		for (let n in r) r[n] === null ? t.removeAttribute(n) : e[n] !== r[n] && n !== "ychange" && t.setAttribute(n, r[n]);
		for (let n in e) r[n] === void 0 && t.removeAttribute(n);
	}
	let i = $E(n), a = i.length, o = t.toArray(), s = o.length, c = g(a, s), l = !1;
	if (e.transact(() => {
		l = hD(e, t, i, o, r, _D);
	}, $), l) return;
	let u = 0, d = 0;
	for (; u < c; u++) {
		let e = o[u], t = i[u];
		if (!aD(r.mapping.get(e), t)) {
			if (!sD(e, t, r.mapping)) break;
			r.mapping.set(e, t);
		}
	}
	for (; d + u + 1 < c; d++) {
		let e = o[s - d - 1], t = i[a - d - 1];
		if (!aD(r.mapping.get(e), t)) {
			if (!sD(e, t, r.mapping)) break;
			r.mapping.set(e, t);
		}
	}
	e.transact(() => {
		for (; s - u - d > 0 && a - u - d > 0;) {
			let n = o[u], c = i[u], l = o[s - d - 1], f = i[a - d - 1];
			if (n instanceof vo && c instanceof Array) {
				iD(n, c) || uD(n, c, r), u += 1;
				continue;
			}
			let p = n instanceof A && oD(n, c), m = l instanceof A && oD(l, f);
			if (p && m && n instanceof A && l instanceof A && !Array.isArray(c) && !Array.isArray(f)) {
				let e = gD(n, c, r), t = gD(l, f, r);
				e.foundMappedChild && !t.foundMappedChild ? m = !1 : !e.foundMappedChild && t.foundMappedChild || e.equalityFactor < t.equalityFactor ? p = !1 : m = !1;
			}
			p && n instanceof A && !Array.isArray(c) ? (_D(e, n, c, r), u += 1) : m && l instanceof A && !Array.isArray(f) ? (_D(e, l, f, r), d += 1) : (PE(r.mapping, t.get(u)), t.delete(u, 1), t.insert(u, [eD(c, r)]), u += 1);
		}
		let n = s - u - d;
		if (s === 1 && a === 0 && o[0] instanceof vo ? (PE(r.mapping, o[0]), o[0].delete(0, o[0].length)) : n > 0 && (t.slice(u, u + n).forEach((e) => PE(r.mapping, e)), t.delete(u, n)), u + d >= a) return;
		let c = [];
		for (let e = u; e < a - d; e++) c.push(eD(i[e], r));
		t.insert(u, c);
	}, $);
}, vD = (e, t) => {
	let n = e.doc.content, r = 0, i = 0;
	for (; r < n.childCount && r < t.childCount && n.child(r) === t.child(r);) i += n.child(r).nodeSize, r++;
	let a = n.childCount, o = t.childCount, s = 0;
	for (; a > r && o > r && n.child(a - 1) === t.child(o - 1);) s += n.child(a - 1).nodeSize, a--, o--;
	if (r === a && r === o) return e;
	let c = new P(t.cut(i, t.size - s), 0, 0), l = Al(e.doc, i, n.size - s, c);
	return l !== null && l.apply(e.doc).doc?.content.eq(t) ? e.step(l) : e.replace(0, n.size, new P(t, 0, 0));
}, yD = class {
	constructor(e, t = /* @__PURE__ */ new Map(), n) {
		if (this.prosemirrorView = null, this.mux = QT(), this.isOMark = /* @__PURE__ */ new Map(), this.beforeTransactionSelection = null, this._domSelectionInView = null, this._invalidContentError = null, this.projectionError = null, this.hasSharedContent = !1, this.pendingTextMerges = [], this.type = e, this.mapping = t, this._observeFunction = this._typeChanged.bind(this), n && (this.onInvalidContent = n, this.reportInvalidContent = (e) => {
			this.projectionError ??= e;
		}, this.deferTextMerge = (e) => {
			this.pendingTextMerges.push(e);
		}), e.doc === null) throw Error("The Yjs fragment must belong to a document");
		this.doc = e.doc, this.beforeAllTransactions = () => {
			this._invalidContentError === null && this.beforeTransactionSelection === null && this.prosemirrorView != null && (this.beforeTransactionSelection = ME(this, this.view.state));
		}, this.afterAllTransactions = () => {
			this.beforeTransactionSelection = null;
		};
	}
	get invalidContentError() {
		return this._invalidContentError;
	}
	get view() {
		if (!this.prosemirrorView) throw Error("The binding has no editor view");
		return this.prosemirrorView;
	}
	get _tr() {
		return this.view.state.tr.setMeta("addToHistory", !1);
	}
	_isLocalCursorInView() {
		return this.view.hasFocus() ? (Ft && this._domSelectionInView === null && (mr(0, () => {
			this._domSelectionInView = null;
		}), this._domSelectionInView = this._isDomSelectionInView()), this._domSelectionInView) : !1;
	}
	_isDomSelectionInView() {
		let e = this.view.root, t = "getSelection" in e && typeof e.getSelection == "function" ? e.getSelection() : this.view.dom.ownerDocument.getSelection();
		if (t == null || t.anchorNode == null || t.focusNode == null) return !1;
		let n = this.view.dom.ownerDocument.createRange();
		n.setStart(t.anchorNode, t.anchorOffset), n.setEnd(t.focusNode, t.focusOffset), n.getClientRects().length === 0 && n.startContainer && n.collapsed && n.selectNodeContents(n.startContainer);
		let r = n.getBoundingClientRect(), i = sr.documentElement;
		return r.bottom >= 0 && r.right >= 0 && r.left <= (window.innerWidth || i.clientWidth || 0) && r.top <= (window.innerHeight || i.clientHeight || 0);
	}
	renderSnapshot(e, t) {
		t ||= Oi(Hr(), /* @__PURE__ */ new Map()), this.view.dispatch(this._tr.setMeta($, {
			snapshot: e,
			prevSnapshot: t
		}));
	}
	createDocumentContent() {
		this.projectionError = null, this.pendingTextMerges = [];
		let e = this.type.toArray().map((e) => {
			if (!(e instanceof A)) throw Ve();
			return JE(e, this.view.state.schema, this);
		}).filter((e) => e !== null), t = M.from(e), { topNodeType: n } = this.view.state.schema;
		this.hasSharedContent ||= this.type.length > 0;
		let r = t.childCount === 0 && !this.hasSharedContent;
		return this.reportInvalidContent && !r && !n.validContent(t) && this.reportInvalidContent(/* @__PURE__ */ RangeError("Shared content does not fit the document schema")), this.projectionError === null && this.pendingTextMerges.forEach(UE), t;
	}
	updateInvalidContentError() {
		let e = this.projectionError, t = e !== null && this._invalidContentError === null;
		return this._invalidContentError = e, t ? e : null;
	}
	notifyInvalidContent(e) {
		var t;
		e && ((t = this.onInvalidContent) == null || t.call(this, e));
	}
	createDocumentTransaction() {
		let e = this.createDocumentContent();
		return this._tr.replace(0, this.view.state.doc.content.size, new P(e, 0, 0));
	}
	unrenderSnapshot() {
		this.mapping.clear(), NE.delete(this.mapping);
		let e = null;
		this.mux(() => {
			let t = this.createDocumentTransaction();
			e = this.updateInvalidContentError(), t.setMeta($, {
				snapshot: null,
				prevSnapshot: null
			}), this.view.dispatch(t);
		}), this.notifyInvalidContent(e);
	}
	_forceRerender() {
		this.mapping.clear(), NE.delete(this.mapping);
		let e = null;
		this.mux(() => {
			let t = this.beforeTransactionSelection === null ? this.view.state.selection : null, n = this.createDocumentTransaction();
			if (e = this.updateInvalidContentError(), t) {
				let e = g(_(t.anchor, 0), n.doc.content.size), r = g(_(t.head, 0), n.doc.content.size);
				n.setSelection(L.create(n.doc, e, r));
			}
			this.view.dispatch(n.setMeta($, {
				isChangeOrigin: !0,
				binding: this
			}));
		}), this.notifyInvalidContent(e);
	}
	_renderSnapshot(e, t, n) {
		let r = this.doc, i = this.type;
		if (e ||= Ai(this.doc), e instanceof Uint8Array || t instanceof Uint8Array) {
			if (!(e instanceof Uint8Array) || !(t instanceof Uint8Array)) throw S();
			if (r = new Jr({ gc: !1 }), li(r, t), t = Ai(r), li(r, e), e = Ai(r), i._item === null) {
				let e = Array.from(this.doc.share.keys()).find((e) => Object.is(this.doc.share.get(e), i));
				i = r.getXmlFragment(e);
			} else {
				let e = r.store.clients.get(i._item.id.client) ?? [], t = e[Ii(e, i._item.id.clock)];
				if (!(t instanceof j && t.content instanceof Yo && t.content.type instanceof fo)) throw S();
				i = t.content.type;
			}
		}
		let a = e, o = t ?? ki;
		this.mapping.clear(), NE.delete(this.mapping), this.mux(() => {
			r.transact((e) => {
				let t = n.permanentUserData;
				t && t.dss.forEach((t) => {
					Ir(e, t, (e) => {});
				});
				let r = (e, r) => {
					let i = t ? e === "added" ? t.getUserByClientId(r.client) : t.getUserByDeletedId(r) : null;
					return {
						user: i,
						type: e,
						color: CE(n.colorMapping, n.colors, i)
					};
				}, s = Ca(i, new Di(o.ds, a.sv)).map((e) => !(e instanceof A) || !e._item ? null : !e._item.deleted || SE(e._item, a) || SE(e._item, o) ? JE(e, this.view.state.schema, {
					mapping: /* @__PURE__ */ new Map(),
					isOMark: /* @__PURE__ */ new Map(),
					reportInvalidContent: this.reportInvalidContent ? () => {} : void 0,
					deferTextMerge: this.reportInvalidContent ? () => {} : void 0
				}, a, o, r) : null).filter((e) => e !== null), c = this._tr.replace(0, this.view.state.doc.content.size, new P(M.from(s), 0, 0));
				this.view.dispatch(c.setMeta($, { isChangeOrigin: !0 }));
			}, $);
		});
	}
	_typeChanged(e, t) {
		if (this.prosemirrorView == null) return;
		let n = xE(this.view.state);
		if (e.length === 0 || n.snapshot != null || n.prevSnapshot != null) {
			this.renderSnapshot(n.snapshot, n.prevSnapshot);
			return;
		}
		let r = t.origin instanceof $i, i = r ? t.origin.currStackItem?.meta.get(this) : void 0, a = i || this.beforeTransactionSelection, o = i ? void 0 : this.view.state.doc, s = null;
		this.mux(() => {
			let e = (e, t) => PE(this.mapping, t);
			Ir(t, t.deleteSet, (e) => {
				e instanceof j && e.content instanceof Yo && PE(this.mapping, e.content.type);
			}), t.changed.forEach(e), t.changedParentTypes.forEach(e);
			let n = vD(this._tr, this.createDocumentContent());
			s = this.updateInvalidContentError(), this._invalidContentError === null && kE(n, a, this, o), n = n.setMeta($, {
				isChangeOrigin: !0,
				isUndoRedoOperation: r
			}), this.beforeTransactionSelection !== null && this._isLocalCursorInView() && n.scrollIntoView(), this.view.dispatch(n);
		}), this.notifyInvalidContent(s);
	}
	_prosemirrorChanged(e) {
		if (this._invalidContentError !== null) return;
		let t = xE(this.view.state);
		t.snapshot == null && t.prevSnapshot == null && this.doc.transact(() => {
			_D(this.doc, this.type, e, this), this.hasSharedContent ||= this.type.length > 0, this.beforeTransactionSelection = ME(this, this.view.state);
		}, $);
	}
	initView(e) {
		this.prosemirrorView != null && this.destroy(), this.prosemirrorView = e, this.doc.on("beforeAllTransactions", this.beforeAllTransactions), this.doc.on("afterAllTransactions", this.afterAllTransactions), this.type.observeDeep(this._observeFunction);
	}
	destroy() {
		this.prosemirrorView != null && (this.prosemirrorView = null, this.type.unobserveDeep(this._observeFunction), this.doc.off("beforeAllTransactions", this.beforeAllTransactions), this.doc.off("afterAllTransactions", this.afterAllTransactions));
	}
}, bD = "__tiptap_position_migrations:", xD = (e, t) => {
	let n = [];
	e.share.forEach((r, i) => {
		if (!i.startsWith(bD) || t && !t.changed.has(r)) return;
		let a = e.getMap(i);
		a.size > 0 && n.push(a);
	}), n.length !== 0 && e.transact((e) => {
		e.meta.set("addToHistory", !1), n.forEach((e) => e.clear());
	}, xD);
}, SD = [{
	light: "#ecd44433",
	dark: "#ecd444"
}], CD = (e, { colors: t = SD, colorMapping: n = /* @__PURE__ */ new Map(), permanentUserData: r = null, onFirstRender: i = () => {}, mapping: a, onInvalidContent: o } = {}) => {
	let s = !1, c = new yD(e, a, o);
	return new z({
		filterTransaction: (e) => c.invalidContentError === null || !e.docChanged || e.getMeta($) !== void 0,
		props: { editable: (e) => {
			let t = xE(e);
			return c.invalidContentError === null && t.snapshot == null && t.prevSnapshot == null;
		} },
		key: $,
		state: {
			init: (i, a) => ({
				type: e,
				doc: c.doc,
				binding: c,
				snapshot: null,
				prevSnapshot: null,
				isChangeOrigin: !1,
				isUndoRedoOperation: !1,
				addToHistory: !0,
				colors: t,
				colorMapping: n,
				permanentUserData: r
			}),
			apply: (e, t) => {
				let n = e.getMeta($);
				return n !== void 0 && (t = Object.assign({}, t, n)), e.docChanged && (t.addToHistory = e.getMeta("addToHistory") !== !1), t.isChangeOrigin = n !== void 0 && !!n.isChangeOrigin, t.isUndoRedoOperation = n !== void 0 && !!n.isChangeOrigin && !!n.isUndoRedoOperation, c.prosemirrorView === null || n === void 0 || n.snapshot == null && n.prevSnapshot == null || mr(0, () => {
					c.prosemirrorView != null && (n.restore == null ? c._renderSnapshot(n.snapshot, n.prevSnapshot, t) : c.invalidContentError === null ? (c._renderSnapshot(n.snapshot, n.snapshot, t), c.mux(() => {
						let e = c.prosemirrorView;
						e && (e.dispatch(c._tr.setMeta($, {
							restore: !1,
							snapshot: null,
							prevSnapshot: null,
							isChangeOrigin: !0
						})), c._prosemirrorChanged(e.state.doc));
					})) : c.unrenderSnapshot());
				}), t;
			}
		},
		view: (e) => {
			let t = (e) => xD(c.doc, e);
			return xD(c.doc), c.doc.on("afterTransaction", t), c.initView(e), a ?? c._forceRerender(), i(), {
				update: () => {
					let t = xE(e.state);
					if (t.snapshot == null && t.prevSnapshot == null) {
						let n = e.state.doc.type.createAndFill();
						if (!n) throw Error("The schema cannot create an empty document");
						if (s || e.state.doc.content.findDiffStart(n.content) !== null) {
							if (s = !0, t.addToHistory === !1 && !t.isChangeOrigin) {
								let t = bE.getState(e.state), n = t && t.undoManager;
								n && n.stopCapturing();
							}
							c.mux(() => {
								t.doc.transact((n) => {
									n.meta.set("addToHistory", t.addToHistory), c._prosemirrorChanged(e.state.doc);
								}, $);
							});
						}
					}
				},
				destroy: () => {
					c.doc.off("afterTransaction", t), c.destroy();
				}
			};
		}
	});
};
function wD(e) {
	let t = bE.getState(e);
	if (!t) throw Error("The editor requires yUndoPlugin");
	return t;
}
var TD = (e, t) => {
	let n = xE(e);
	if (n.binding.invalidContentError !== null || n.snapshot != null || n.prevSnapshot != null) return !1;
	let r = wD(e).undoManager;
	if (r != null) return r[t](), !0;
}, ED = (e) => TD(e, "undo"), DD = (e) => TD(e, "redo"), OD = /* @__PURE__ */ new Set(["paragraph"]), kD = (e, t) => !(e instanceof j) || !(e.content instanceof Yo) || !(e.content.type instanceof co || e.content.type instanceof A && t.has(e.content.type.nodeName)) || e.content.type._length === 0, AD = ({ protectedNodes: e = OD, trackedOrigins: t = [], undoManager: n = null } = {}) => new z({
	key: bE,
	state: {
		init: (r, i) => {
			let a = xE(i), o = /* @__PURE__ */ new Set(), s = n;
			if (!s) {
				let n = new Set(a.doc._observers.get("destroy"));
				s = new $i(a.type, {
					trackedOrigins: /* @__PURE__ */ new Set([$, ...t]),
					deleteFilter: (t) => kD(t, e),
					captureTransaction: (e) => e.meta.get("addToHistory") !== !1
				}), (a.doc._observers.get("destroy") ?? /* @__PURE__ */ new Set()).forEach((e) => {
					n.has(e) || o.add(e);
				});
			}
			return {
				undoManager: s,
				prevSel: null,
				hasUndoOps: s.undoStack.length > 0,
				hasRedoOps: s.redoStack.length > 0,
				destroyListeners: o
			};
		},
		apply: (e, t, n, r) => {
			let i = xE(r).binding, a = i && i.invalidContentError === null;
			return {
				...t,
				prevSel: a ? ME(i, n) : t.prevSel,
				hasUndoOps: t.undoManager.undoStack.length > 0,
				hasRedoOps: t.undoManager.redoStack.length > 0
			};
		}
	},
	view: (e) => {
		let t = xE(e.state), { undoManager: n, destroyListeners: r } = wD(e.state);
		return n.on("stack-item-added", ({ stackItem: r }) => {
			let i = t.binding;
			if (i) {
				let t = n.undoing || n.redoing ? i.beforeTransactionSelection : wD(e.state).prevSel;
				r.meta.set(i, t);
			}
		}), { destroy: () => {
			n.destroy(), r.forEach((e) => n.doc.off("destroy", e)), r.clear();
		} };
	}
});
// node_modules/@tiptap/extension-collaboration/dist/index.js
function jD(e) {
	return !!e.getMeta($);
}
function MD(e, t) {
	if (t === null) return 0;
	let n = PD(e);
	return yE(n.doc, n.type, t, n.binding.mapping) || 0;
}
function ND(e, t) {
	let n = PD(e);
	return mE(t, n.type, n.binding.mapping);
}
function PD(e) {
	let t = $.getState(e);
	if (!t) throw Error("Collaboration requires the Yjs sync plugin");
	return t;
}
var FD = class e extends Fv {
	constructor(e, t) {
		super(e), this.yRelativePosition = t;
	}
	static fromJSON(t) {
		return new e(t.position, t.yRelativePosition);
	}
	toJSON() {
		return {
			position: this.position,
			yRelativePosition: this.yRelativePosition
		};
	}
};
function ID(e, t) {
	return new FD(e, ND(t, e));
}
function LD(e, t, n) {
	let r = e instanceof FD ? e.yRelativePosition : null;
	if (jD(t) && r) return {
		position: new FD(MD(n, r), r),
		mapResult: null
	};
	let i = Iv(e, t), a = i.position.position;
	return {
		position: new FD(a, r ?? ND(n, a)),
		mapResult: i.mapResult
	};
}
function RD(e) {
	let t = bE.getState(e);
	if (!t) throw Error("Collaboration requires the Yjs undo plugin");
	return t.undoManager;
}
var zD = J.create({
	name: "collaboration",
	priority: 1e3,
	addOptions() {
		return {
			document: null,
			field: "default",
			fragment: null,
			provider: null
		};
	},
	addStorage() {
		return { isDisabled: !1 };
	},
	onCreate() {
		this.editor.extensionManager.extensions.find((e) => e.name === "undoRedo") && console.warn("[tiptap warn]: \"@tiptap/extension-collaboration\" comes with its own history support and is not compatible with \"@tiptap/extension-undo-redo\".");
	},
	onBeforeCreate() {
		this.editor.utils.getUpdatedPosition = (e, t) => LD(e, t, this.editor.state), this.editor.utils.createMappablePosition = (e) => ID(e, this.editor.state);
	},
	addCommands() {
		return {
			undo: () => ({ tr: e, state: t, dispatch: n }) => (e.setMeta("preventDispatch", !0), RD(t).undoStack.length === 0 ? !1 : n ? ED(t) ?? !1 : !0),
			redo: () => ({ tr: e, state: t, dispatch: n }) => (e.setMeta("preventDispatch", !0), RD(t).redoStack.length === 0 ? !1 : n ? DD(t) ?? !1 : !0)
		};
	},
	addKeyboardShortcuts() {
		return {
			"Mod-z": () => this.editor.commands.undo(),
			"Mod-y": () => this.editor.commands.redo(),
			"Shift-Mod-z": () => this.editor.commands.redo()
		};
	},
	addProseMirrorPlugins() {
		let e = this.options.fragment ? this.options.fragment : this.options.document.getXmlFragment(this.options.field), t = AD(this.options.yUndoOptions), n = t.spec.view;
		t.spec.view = (e) => {
			let t = RD(e.state);
			t.restore &&= (t.restore(), () => {});
			let r = n ? n(e) : void 0;
			return { destroy: () => {
				let e = t.trackedOrigins.has(t), n = t._observers;
				t.restore = () => {
					e && t.trackedOrigins.add(t), t.doc.on("afterTransaction", t.afterTransactionHandler), t._observers = n;
				}, r?.destroy && r.destroy();
			} };
		};
		let r = {
			...this.options.ySyncOptions,
			onFirstRender: this.options.onFirstRender
		};
		return this.editor.options.enableContentCheck && (r.onInvalidContent = (t) => {
			this.editor.emit("contentError", {
				error: t,
				editor: this.editor,
				disableCollaboration: () => {
					var t;
					this.storage.isDisabled = !0, (t = e.doc) == null || t.destroy();
				}
			});
		}), [
			CD(e, r),
			t,
			new z({ filterTransaction: (e, t) => (e.getMeta("inputRule") && RD(t).stopCapturing(), !0) }),
			this.editor.options.enableContentCheck && new z({
				key: new B("filterInvalidContent"),
				filterTransaction: (t) => {
					if (!jD(t)) return !0;
					if (this.storage.isDisabled) return !1;
					if (!t.docChanged) return !0;
					try {
						return t.doc.check(), !0;
					} catch (t) {
						return this.storage.isDisabled = !0, this.editor.emit("contentError", {
							error: t,
							editor: this.editor,
							disableCollaboration: () => {
								var t;
								(t = e.doc) == null || t.destroy();
							}
						}), !0;
					}
				}
			})
		].filter((e) => e !== !1);
	}
});
// resources/js/collaborative-rich-editor.js
function BD({ documentId: e, updatesUrl: t, csrfToken: n, isDisabled: r, label: i, placeholder: a, statePath: o }) {
	return {
		status: "Connecting…",
		editor: null,
		ydoc: null,
		cursor: 0,
		queue: [],
		queueKey: "",
		sending: !1,
		syncing: !1,
		recoveryFailed: !1,
		storageFailed: !1,
		pollTimer: null,
		async init() {
			if (!e || !t) {
				this.status = "Save the record first to enable live collaboration.";
				return;
			}
			this.ydoc = new Jr();
			let n = document.querySelector("meta[name=\"collaboration-user\"]")?.content || "anon";
			this.queueKey = `collaboration-pending:${n}:${e}:${o}`;
			try {
				let e = JSON.parse(sessionStorage.getItem(this.queueKey) || "[]");
				if (!Array.isArray(e) || e.some((e) => typeof e?.update != "string" || typeof e?.client_update_id != "string")) throw Error("Invalid queue");
				this.queue = e;
			} catch {
				this.recoveryFailed = !0, this.status = "Pending edits could not be recovered.";
			}
			this.ydoc.on("update", (e, t) => {
				t === "remote" || r || (this.queue.push({
					client_update_id: crypto.randomUUID(),
					update: btoa(Array.from(e, (e) => String.fromCharCode(e)).join(""))
				}), this.persistQueue(), this.storageFailed || (this.status = "Saving…"), this.flushQueue());
			}), this.onBeforeUnload = (e) => {
				this.queue.length && (e.preventDefault(), e.returnValue = "");
			}, window.addEventListener("beforeunload", this.onBeforeUnload), await this.sync(), this.pollTimer = setInterval(() => this.sync(), 2e3);
		},
		persistQueue() {
			try {
				sessionStorage.setItem(this.queueKey, JSON.stringify(this.queue)), this.storageFailed = !1;
			} catch {
				this.storageFailed = !0, this.status = "Storage unavailable: keep this tab open until synced";
			}
		},
		async call(e, t = {}) {
			let r = await fetch(e, {
				credentials: "same-origin",
				...t,
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					"X-CSRF-TOKEN": n,
					...t.headers || {}
				}
			});
			if (!r.ok) throw Error(`HTTP ${r.status}`);
			return r.status === 204 ? null : r.json();
		},
		async flushQueue() {
			if (!(this.sending || !this.queue.length || r)) {
				this.sending = !0;
				try {
					for (; this.queue.length;) await this.call(t, {
						method: "POST",
						body: JSON.stringify(this.queue[0])
					}), this.queue.shift(), this.persistQueue();
					this.status = "Synced";
				} catch {
					this.status = "Offline: changes pending in this tab";
				} finally {
					this.sending = !1;
				}
			}
		},
		async sync() {
			if (!(this.syncing || this.recoveryFailed)) {
				this.syncing = !0;
				try {
					let e;
					do {
						e = (await this.call(`${t}?after=${this.cursor}`)).updates || [];
						for (let t of e) ui(this.ydoc, Uint8Array.from(atob(t.update), (e) => e.charCodeAt(0)), "remote"), this.cursor = t.id;
					} while (e.length === 500);
					if (!this.editor) {
						for (let e of this.queue) ui(this.ydoc, Uint8Array.from(atob(e.update), (e) => e.charCodeAt(0)), "remote");
						this.editor = new Lb({
							element: this.$refs.editor,
							editable: !r,
							extensions: [ZT.configure({ undoRedo: !1 }), zD.configure({ document: this.ydoc })],
							editorProps: { attributes: {
								class: "fi-fo-rich-editor-content fi-prose tiptap",
								role: "textbox",
								"aria-multiline": "true",
								...i ? { "aria-label": i } : {},
								...a ? { "data-placeholder": a } : {}
							} }
						});
					}
					this.queue.length || (this.status = "Synced"), await this.flushQueue();
				} catch {
					this.status = "Connection unavailable; retrying.";
				} finally {
					this.syncing = !1;
				}
			}
		},
		destroy() {
			this.pollTimer && clearInterval(this.pollTimer), this.onBeforeUnload && window.removeEventListener("beforeunload", this.onBeforeUnload), this.editor?.destroy(), this.ydoc?.destroy();
		}
	};
}
export { BD as default };
