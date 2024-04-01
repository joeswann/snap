import React from "react";

type withComponentProps<P> = P & {
  className?: string;
  children?: React.Element;
};

export type DefaultComponentInterface<P = unknown> = React.FC<
  withComponentProps<P>
>;
