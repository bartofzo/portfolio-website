const shader = `


   varying vec2 vTextureCoord;
   uniform sampler2D uSampler;


   vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
      vec4 color = vec4(0.0);
      vec2 off1 = vec2(1.3846153846) * direction;
      vec2 off2 = vec2(3.2307692308) * direction;
      color += texture2D(image, uv) * 0.2270270270;
      color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
      color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
      color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
      color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
      return color;
   }

   void main(void)
   {
      //vec4 col = texture2D(uSampler, vTextureCoord);

      vec4 col = blur9(uSampler, vTextureCoord, vec2(1000.0,1.0), vec2(1.0, 0.0));

      col.rgb *= 0.5 + 0.5 * (vTextureCoord.x * vTextureCoord.y);

      gl_FragColor = col;
   }
`
export default shader;