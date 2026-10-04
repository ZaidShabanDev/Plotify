precision highp float;

uniform vec3 uColor;
uniform float uLineOpacity;

varying float vOpacity;

void main() {
    float alpha = uLineOpacity * vOpacity;

    gl_FragColor = vec4(uColor, alpha);
}