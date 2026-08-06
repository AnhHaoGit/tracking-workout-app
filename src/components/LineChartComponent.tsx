import React from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { StatisticsDataPoint } from "@/constants/type";

const COLORS = {
  background: "#000000",
  card: "#181818",
  border: "#717171",
  textPrimary: "#ffffff",
  textSecondary: "#717171",
  accent: "#ff9100",
};

const CHART_HEIGHT = 220;
const INITIAL_SPACING = 16;
const SPACING = 64;
const screenWidth = Dimensions.get("window").width;

const VolumeLineChart = ({
  data,
  unit,
}: {
  data: StatisticsDataPoint[];
  unit: string;
}) => {
  const [focusedItem, setFocusedItem] = React.useState<{
    value: number;
    label?: string;
  } | null>(null);

  return (
    <View>
      <LineChart
        data={data}
        height={CHART_HEIGHT}
        width={screenWidth * 0.8}
        initialSpacing={INITIAL_SPACING}
        endSpacing={16}
        spacing={SPACING}
        thickness={3}
        color={COLORS.accent}
        curved
        curveType={0}
        areaChart
        startFillColor={COLORS.accent}
        endFillColor={COLORS.background}
        startOpacity={0.35}
        endOpacity={0.35}
        dataPointsColor={COLORS.accent}
        dataPointsRadius={4}
        // === Focus interaction — chạm vào đâu, focus đúng điểm gần nhất tại đó ===
        focusEnabled
        focusProximity={40}
        showDataPointOnFocus
        focusedDataPointColor={COLORS.accent}
        focusedDataPointRadius={6}
        showStripOnFocus
        stripColor={COLORS.border}
        stripWidth={1}
        stripOpacity={0.6}
        stripHeight={CHART_HEIGHT}
        unFocusOnPressOut={false}
        delayBeforeUnFocus={0}
        onFocus={(item: any) => {
          setFocusedItem({ value: item.value, label: item.label });
        }}
        yAxisColor={COLORS.border}
        yAxisTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
        noOfSections={4}
        xAxisColor={COLORS.border}
        xAxisLabelTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
        rulesThickness={0}
        backgroundColor="transparent"
      />

      <View
        style={{
          marginTop: 20,
          alignSelf: "center",
          backgroundColor: COLORS.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: COLORS.border,
          paddingHorizontal: 10,
          paddingVertical: 5,
          alignItems: "center",
          opacity: focusedItem ? 1 : 0,
          gap: 4,
        }}
      >
        <Text style={{ color: COLORS.textSecondary, fontSize: 11 }}>
          {focusedItem?.label ?? " "}
        </Text>
        <Text className="font-sans-bold text-text-primary">
          {focusedItem ? `${focusedItem.value} ${unit}` : ""}
        </Text>
      </View>
    </View>
  );
};

export default VolumeLineChart;
