import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="BookDetails/index" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AddBook/index" 
        options={{ 
          title: "Add New Book",
          headerStyle: {
            backgroundColor: "#f5f5f5"
          }
        }} 
      />
    </Stack>
  );
}
