precision highp float;

uniform vec3 uColor;
uniform float uLineOpacity;

varying float vOpacity;

vec3 linearToSRGB(vec3 color);

void main() {
    float alpha = uLineOpacity * vOpacity;

    gl_FragColor = vec4(linearToSRGB(uColor), alpha);
}