import React from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { StatisticsDataPoint } from "@/constants/type";

const COLORS = {
  background: "#000000",
  card: "#181818",
  border: "#717171",
  textPrimary: "#ffffff",
  textSecondary: "#717171",
};

const LINE_COLORS = [
  "#ff9100",
  "#58c5cc",
  "#ff5050",
  "#81c784",
  "#e57373",
  "#7c5cff",
  "#4caf50",
  "#ffc107",
];

type Props = {
  data: StatisticsDataPoint[][];
  unit: string;
};

const MultiLineChartComponent = ({ data, unit }: Props) => {
  const CHART_HEIGHT = 220;

  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

  const dataSet = data.map((setLine, index) => ({
    data: setLine,
    color: LINE_COLORS[index % LINE_COLORS.length],
    dataPointsColor: LINE_COLORS[index % LINE_COLORS.length],
    thickness: 3,
    curved: true,
  }));

  const focusedLabel =
    focusedIndex !== null ? data[0]?.[focusedIndex]?.label : null;

  return (
    <View>
      <LineChart
        dataSet={dataSet}
        height={CHART_HEIGHT}
        width={300}
        initialSpacing={16}
        endSpacing={16}
        spacing={64}
        hideDataPoints={false}
        dataPointsRadius={0}
        focusEnabled
        focusProximity={40}
        showDataPointOnFocus
        focusedDataPointRadius={3}
        showStripOnFocus
        stripColor={COLORS.border}
        stripWidth={1}
        stripOpacity={0.6}
        stripHeight={CHART_HEIGHT}
        unFocusOnPressOut={false}
        delayBeforeUnFocus={0}
        focusTogether
        onFocus={(_item: any, index: number) => {
          setFocusedIndex(index);
        }}
        yAxisColor={COLORS.border}
        yAxisTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
        noOfSections={4}
        xAxisColor={COLORS.border}
        xAxisLabelTextStyle={{ color: COLORS.textSecondary, fontSize: 11 }}
        rulesType="solid"
        rulesColor={COLORS.border}
        rulesThickness={1}
        backgroundColor="transparent"
      />

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 12,
          justifyContent: "center",
        }}
      >
        {data.map((_, index) => (
          <View
            key={index}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: LINE_COLORS[index % LINE_COLORS.length],
              }}
            />
            <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
              Set {index + 1}
            </Text>
          </View>
        ))}
      </View>
      <View
        style={{
          marginTop: 20,
          alignSelf: "center",
          backgroundColor: COLORS.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: COLORS.border,
          paddingHorizontal: 14,
          paddingVertical: 10,
          alignItems: "center",
          opacity: focusedIndex !== null ? 1 : 0,
          gap: 6,
          minWidth: 140,
        }}
      >
        <Text style={{ color: COLORS.textSecondary, fontSize: 11 }}>
          {focusedLabel ?? " "}
        </Text>

        {focusedIndex !== null &&
          data.map((setLine, index) => {
            const point = setLine[focusedIndex];
            return (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: LINE_COLORS[index % LINE_COLORS.length],
                    }}
                  />
                  <Text style={{ color: COLORS.textSecondary, fontSize: 11 }}>
                    Set {index + 1}
                  </Text>
                </View>
                <Text
                  style={{
                    color: COLORS.textPrimary,
                    fontSize: 13,
                    fontWeight: "700",
                  }}
                >
                  {point ? `${point.value} ${unit}` : "—"}
                </Text>
              </View>
            );
          })}
      </View>
    </View>
  );
};

export default MultiLineChartComponent;
