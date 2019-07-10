import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder
} from "react-native";
import styles from "./style";

const SUPPORTED_ORIENTATIONS = [
  "portrait",
  "portrait-upside-down",
  "landscape",
  "landscape-left",
  "landscape-right"
];

class RawBottomSheet extends Component {
  static propTypes = {
    animationType: PropTypes.oneOf(["none", "slide", "fade"]),
    height: PropTypes.number,
    minClosingHeight: PropTypes.number,
    duration: PropTypes.number,
    closeOnDragDown: PropTypes.bool,
    modal: PropTypes.bool,
    closeOnPressMask: PropTypes.bool,
    customStyles: PropTypes.objectOf(PropTypes.object),
    onClose: PropTypes.func,
    children: PropTypes.node
  };

  static defaultProps = {
    animationType: "none",
    height: 260,
    minClosingHeight: 0,
    duration: 200,
    closeOnDragDown: false,
    closeOnPressMask: true,
    modal: false,
    customStyles: {},
    onClose: null,
    children: <View />
  };

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      animatedHeight: new Animated.Value(0),
      pan: new Animated.ValueXY()
    };

    this.createPanResponder(props);
  }

  setModalVisible(visible) {
    const { height, minClosingHeight, duration, onClose } = this.props;
    const { animatedHeight, pan } = this.state;
    if (visible) {
      this.setState({ modalVisible: visible });
      Animated.timing(animatedHeight, {
        toValue: height,
        duration
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: minClosingHeight,
        duration
      }).start(() => {
        pan.setValue({ x: 0, y: 0 });
        this.setState({
          modalVisible: visible,
          animatedHeight: new Animated.Value(0)
        });

        if (typeof onClose === "function") onClose();
      });
    }
  }

  createPanResponder(props) {
    const { closeOnDragDown, height } = props;
    const { pan } = this.state;
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => closeOnDragDown,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: pan.y }])(e, gestureState);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (height / 4 - gestureState.dy < 0) {
          this.setModalVisible(false);
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 } }).start();
        }
      }
    });
  }

  open() {
    this.setModalVisible(true);
  }

  close() {
    this.setModalVisible(false);
  }

  render() {
    const {
      animationType,
      closeOnPressMask,
      children,
      customStyles,
      modal,
    } = this.props;
    const { animatedHeight, pan, modalVisible } = this.state;
    const panStyle = {
      transform: pan.getTranslateTransform()
    };

    const contentContainer = () => (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={[
          panStyle,
          styles.container,
          customStyles.container,
          { height: animatedHeight }
        ]}
      >
        <View
          style={{
            backgroundColor: '#cbcbcb',
            height: 5,
            width: 20,
            borderRadius: 4,
            marginTop: 12,
          }}
        />
        {children}
      </Animated.View>
    );

    if (modal) {
      return (
        <Modal
          transparent
          animationType={animationType}
          visible={modalVisible}
          supportedOrientations={SUPPORTED_ORIENTATIONS}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}
        >
          <View style={[styles.wrapper, customStyles.wrapper]}>
            <TouchableOpacity
              style={styles.mask}
              activeOpacity={1}
              onPress={() => (closeOnPressMask ? this.close() : {})}
            />
            {contentContainer()}
          </View>
        </Modal>
      )
    }

    return contentContainer();
  }
}

export default RawBottomSheet;
