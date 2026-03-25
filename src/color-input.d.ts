import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'color-input': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          theme?: 'auto' | 'light' | 'dark';
          'no-alpha'?: boolean;
          colorspace?: string;
        },
        HTMLElement
      >;
    }
  }
}
