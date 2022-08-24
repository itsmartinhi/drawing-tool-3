export default class Color {
    private r: number;
    private g: number;
    private b: number;
    private alpha: number;

    // constants for default colors
    public static TRANSPARENT: Color = new Color(255, 255, 255, 0);

    public static RED: Color = new Color(255, 0, 0);
    public static GREEN: Color = new Color(0, 255, 0);
    public static YELLOW: Color = new Color(255, 255, 0);
    public static BLUE: Color = new Color(0, 0, 255);
    public static BLACK: Color = new Color(0, 0, 0);

    constructor(r: number, g: number, b: number, alpha: number = 1) {
        // todo: check if values are valid (rgb between 0 and 255 and alpha between 0 and 1)
        this.r = r;
        this.g = g;
        this.b = b;
        this.alpha = alpha;
    }

    public getRGBAString(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha})`;
    }
}