const fragment = /* glsl*/ `
in vec3 dColor;

void main() {
    gl_FragColor = vec4(dColor, 1.0);
} 
`;
export default fragment