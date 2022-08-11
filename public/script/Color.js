export default class Color {
    constructor(r, g, b, alpha = 1) {
        // todo: check if values are valid (rgb between 0 and 255 and alpha between 0 and 1)
        this.r = r;
        this.g = g;
        this.b = b;
        this.alpha = alpha;
    }
    getRGBAString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha})`;
    }
}
// constants for default colors
Color.TRANSPARENT = new Color(255, 255, 255, 0);
Color.RED = new Color(255, 0, 0);
Color.GREEN = new Color(0, 255, 0);
Color.YELLOW = new Color(255, 255, 0);
Color.BLUE = new Color(0, 0, 255);
Color.BLACK = new Color(0, 0, 0);
//# sourceMappingURL=Color.js.map