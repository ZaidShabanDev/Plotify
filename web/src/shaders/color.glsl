precision highp float;

vec3 linearToSRGB(vec3 c_lin) {
    vec3 srgb_lo = c_lin * 12.92;
    vec3 srgb_hi = 1.055 * pow(c_lin, vec3(1.0 / 2.4)) - 0.055;
    return mix(srgb_lo, srgb_hi, step(vec3(0.0031308), c_lin));
}
