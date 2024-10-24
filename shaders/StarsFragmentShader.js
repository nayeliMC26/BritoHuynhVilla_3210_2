const fragment = /* glsl*/ `
uniform sampler2D pointTexture;

varying vec3 vColor;

void main() {

    gl_FragColor = vec4( vColor, 0.5 );

    gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
} 
`;
export default fragment