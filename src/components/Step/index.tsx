import { useColorModeValue } from '@chakra-ui/color-mode';
import { Spinner } from '@chakra-ui/spinner';
import {
  chakra,
  forwardRef,
  HTMLChakraProps,
  ThemingProps,
  useStyles,
} from '@chakra-ui/system';
import { darken, lighten, mode } from '@chakra-ui/theme-tools';
import { Collapse } from '@chakra-ui/transition';
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';
import { Connector } from '../Connector';
import { CheckIcon, CloseIcon } from '../Icons';

const AnimatedCheck = motion(CheckIcon);
const AnimatedCloseIcon = motion(CloseIcon);
const AnimatedSpan = motion(chakra.span);

export interface StepProps extends HTMLChakraProps<'div'> {
  label?: string;
  description?: string;
  icon?: React.ComponentType<any>;
}

// Props which shouldn't be passed to to the Step component from the user
interface StepInternalConfig extends ThemingProps {
  index?: number;
  isCompletedStep?: boolean;
  isCurrentStep?: boolean;
  isLastStep?: boolean;
  orientation?: 'vertical' | 'horizontal';
  isLoading?: boolean;
  isError?: boolean;
  state?: 'loading' | 'error';
}

const animationConfig = {
  transition: {
    duration: 0.15,
  },
  exit: { scale: 0, opacity: 0 },
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
};

interface FullStepProps extends StepProps, StepInternalConfig {}

export const Step = forwardRef<StepProps, 'div'>(
  (props, ref: React.Ref<any>) => {
    const {
      children,
      isCompletedStep,
      isCurrentStep,
      index,
      colorScheme: c,
      label: labelProp,
      isLastStep,
      icon: CustomIcon,
      orientation,
      description: descriptionProp,
      state,
      ...styleProps
    } = props as FullStepProps;

    const Icon = React.useMemo(() => (CustomIcon ? motion(CustomIcon) : null), [
      CustomIcon,
    ]);

    const { step, stepIcon, label, description, icon } = useStyles();

    const activeBg = `${c}.500`;

    const inactiveBg = useColorModeValue(`gray.200`, `gray.700`);

    const isError = state === 'error';
    const isLoading = state === 'loading';

    const getBorderColor = React.useMemo(() => {
      if (isCompletedStep) return activeBg;
      if (isCurrentStep) {
        if (isError) {
          return 'red.500';
        }
        return activeBg;
      }
      return inactiveBg;
    }, [isError, isCompletedStep, isCurrentStep, activeBg, inactiveBg]);

    const getBgColor = React.useMemo(() => {
      if (isCompletedStep) return activeBg;
      if (isCurrentStep) {
        if (isError) {
          return 'red.500';
        }
        return mode(darken(inactiveBg, 0.5), lighten(inactiveBg, 0.5));
      }
      return inactiveBg;
    }, [isError, isCompletedStep, isCurrentStep, activeBg, inactiveBg]);

    const hasVisited = isCurrentStep || isCompletedStep;

    const opacity = hasVisited ? 1 : 0.8;

    const isVertical = orientation === 'vertical';

    const renderIcon = () => {
      if (isCompletedStep) {
        return (
          <AnimatedCheck
            key="icon"
            color="white"
            {...animationConfig}
            {...icon}
          />
        );
      }
      if (isCurrentStep) {
        if (isError)
          return (
            <AnimatedCloseIcon
              key="icon"
              color="white"
              {...animationConfig}
              {...icon}
            />
          );
        if (isLoading)
          return (
            <Spinner
              width={icon.width as string}
              height={icon.height as string}
            />
          );
      }
      if (Icon) return <Icon />;
      return (
        <AnimatedSpan key="label" __css={label} {...animationConfig}>
          {(index || 0) + 1}
        </AnimatedSpan>
      );
    };

    return (
      <>
        <chakra.div
          ref={ref}
          {...styleProps}
          aria-disabled={!hasVisited}
          __css={{
            ...step,
            opacity,
            flexDir: isVertical ? 'column' : 'row',
            alignItems: isVertical ? 'flex-start' : 'center',
            flex: isLastStep && !isVertical ? '0 0 auto' : '1 0 auto',
            justifyContent:
              isLastStep && !isVertical ? 'flex-end' : 'flex-start',
          }}
        >
          <chakra.div
            __css={{
              display: 'flex',
              flexDir: 'row',
              alignItems: 'center',
            }}
          >
            <chakra.div
              __css={{
                ...stepIcon,
                bg: getBgColor,
                borderColor: getBorderColor,
              }}
            >
              <AnimatePresence exitBeforeEnter>{renderIcon()}</AnimatePresence>
            </chakra.div>
            <chakra.div
              aria-current={isCurrentStep}
              __css={{
                display: 'flex',
                flexDir: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}
            >
              {!!labelProp && (
                <chakra.span __css={{ mx: 2, opacity, ...label }}>
                  {labelProp}
                </chakra.span>
              )}
              {!!descriptionProp && (
                <chakra.span __css={{ mx: 2, opacity, ...description }}>
                  {descriptionProp}
                </chakra.span>
              )}
            </chakra.div>
          </chakra.div>
          <Connector
            colorScheme={c}
            isLastStep={isLastStep}
            isVertical={isVertical}
            isCompletedStep={isCompletedStep || false}
            hasLabel={!!labelProp || !!descriptionProp}
          >
            <Collapse style={{ width: '100%' }} in={isCurrentStep}>
              {children}
            </Collapse>
          </Connector>
        </chakra.div>
      </>
    );
  }
);
