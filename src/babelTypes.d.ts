type InputOptions = {
  cwd?: string,
  filename?: string,
  filenameRelative?: string,
  babelrc?: boolean,
  babelrcRoots?: any,
  configFile?: any,
  root?: string,
  rootMode?: any,
  code?: boolean,
  ast?: boolean,
  cloneInputAst?: boolean,
  inputSourceMap?: any,
  envName?: string,
  caller?: any,

  extends?: string,
  env?: any,
  ignore?: any,
  only?: any,
  overrides?: any,

  // Generally verify if a given config object should be applied to the given file.
  test?: any,
  include?: any,
  exclude?: any,

  presets?: any,
  plugins?: any,
  passPerPreset?: boolean,

  assumptions?: { [name: string]: boolean },

  // browserslists-related options
  targets?: any,
  browserslistConfigFile?: any,
  browserslistEnv?: string,

  // Options for @babel/generator
  retainLines?: boolean,
  comments?: boolean,
  shouldPrintComment?: Function,
  compact?: any,
  minified?: boolean,
  auxiliaryCommentBefore?: string,
  auxiliaryCommentAfter?: string,

  // Parser
  sourceType?: any,

  wrapPluginVisitorMethod?: Function,
  highlightCode?: boolean,

  // Sourcemap generation options.
  sourceMaps?: any,
  sourceMap?: any,
  sourceFileName?: string,
  sourceRoot?: string,

  // AMD/UMD/SystemJS module naming options.
  getModuleId?: Function,
  moduleRoot?: string,
  moduleIds?: boolean,
  moduleId?: string,

  // Deprecate top level parserOpts
  parserOpts?: {},
  // Deprecate top level generatorOpts
  generatorOpts?: {},
};

export function transformSync(code: string, opts: InputOptions): any;

export function pluginTransformReactJsxSelf(...args: any): any;
export function pluginTransformReactJsxSource(...args: any): any;