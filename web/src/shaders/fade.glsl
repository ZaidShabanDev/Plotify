float sphereFadeOpacity(vec3 position, vec4 viewPosition, mat4 modelViewMatrix, mat3 normalMatrix, float radius, float backOpacity) {
    vec4 viewCenter = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);

    // valid only while the sphere is centered at the object origin
    vec3 viewNormal = normalMatrix * normalize(position);
    vec3 toCamera = normalize(-viewPosition.xyz);

    float facing = dot(viewNormal, toCamera);
    float facingVisibility = smoothstep(-1.0, 1.0, facing);
    float cameraDistance = length(viewCenter.xyz);
    float outsideWeight = smoothstep(radius - 0.1, radius, cameraDistance);
    float visibility = mix(1.0, facingVisibility, outsideWeight);

    return mix(backOpacity, 1.0, visibility);
}