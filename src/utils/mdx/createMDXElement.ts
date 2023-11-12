import { u } from "unist-builder";
import type { Node } from "unist";

export interface UnistTree extends Node {
  children: UnistNode[];
}

export interface UnistNode extends Node {
  type: string;
  name?: string;
  value?: string;
  tagName?: string;
  depth?: number;
  attributes?: UnistNodeAttr[];
  properties?: Record<string, unknown>;
  children?: UnistNode[];
  data?: {
    meta?: string;
    _mdxExplicitJsx?: boolean;
  };
}

export interface UnistNodeAttr {
  type: string;
  name: string;
  value: unknown;
}

interface Args {
  name: string;
  props?: Record<string, unknown>;
  children?: UnistNode[];
}

export const createMdxElement = ({
  name,
  props = {},
  children = [],
}: Args): UnistNode => {
  const isHtmlElement = name.toLowerCase() === name;
  if (isHtmlElement) {
    return u("element", { tagName: name, properties: props }, children as any);
  }

  return u("mdxJsxFlowElement", {
    name,
    children,
    attributes: [
      ...Object.entries(props).map(([name, value]) => ({
        name,
        type: "mdxJsxAttribute",
        value: typeof value === "boolean" ? boolean(value) : value,
      })),
    ],
    data: { _mdxExplicitJsx: true },
  });
};

const boolean = (value: boolean) => ({
  type: "mdxJsxAttributeValueExpression",
  data: {
    estree: {
      sourceType: "module",
      type: "Program",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            type: "Literal",
            value,
          },
        },
      ],
    },
  },
});
