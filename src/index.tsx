import React from 'react';
import { ExoticComponent, ReactElement } from 'react';

interface ConsumerComposerRule<T> {
  ContextConsumer: ExoticComponent<{
    children: (value: T) => ReactElement | null;
  }>;
  processor?: (context: T, prevResults: any[]) => any;
  props?: { [key: string]: any };
}

/**
 *  <ConsumerComposer rules={[
 *    { ContextConsumer: SafeAreaContext.Consumer, processor: (safeArea, []) => safeArea.top },
 *    { ContextConsumer: ThemeContext.Consumer, processor: (theme, [safeArea]) => theme.primaryBackground },
 *    { ContextConsumer: ViewportContext.Consumer, processor: (viewport, [safeArea, theme]) => ([{ height: viewport.height - safeArea }, theme.secondaryBackground])}
 * ]}>
 * {([safeAreaTop, background, contentStyle]) => (
 *  <View style={[{ paddingTop: safeAreaTop }, background]} >
 *    <View style={contentStyle} />
 *  </View>
 * )}
 * </ConsumerComposer>
 *
 *
 */
export default function ConsumerComposer({
  rules,
  children
}: {
  rules: Array<ConsumerComposerRule<unknown>>;
  children: (values: Array<any>) => ReactElement | null;
}): ReactElement | null {
  const rulesStack = rules.slice();
  let rule: ConsumerComposerRule<unknown> | undefined;
  const values: unknown[] = [];
  const consumeRule = () => {
    rule = rulesStack.shift();
    if (!rule) {
      return children(values.slice());
    } else {
      const { ContextConsumer, processor, props } = rule;
      return (
        <ContextConsumer {...(props || {})}>
          {(context: unknown) => {
            values.push(
              processor ? processor(context, values.slice()) : context
            );
            return consumeRule();
          }}
        </ContextConsumer>
      );
    }
  };

  return consumeRule();
}
