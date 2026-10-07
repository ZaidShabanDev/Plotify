precision highp float;

varying float vOpacity;
varying vec3 vColor;

vec3 linearToSRGB(vec3 color);

void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
    if(dist > 0.5) {
        discard;
    }

    gl_FragColor = vec4(linearToSRGB(vColor), alpha * vOpacity);
}