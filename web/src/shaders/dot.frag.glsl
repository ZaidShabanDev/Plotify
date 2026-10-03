precision highp float;

varying float vOpacity;

void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
    if(dist > 0.5) {
        discard;
    }

    gl_FragColor = vec4(0.13, 0.13, 0.13, alpha * vOpacity);
}