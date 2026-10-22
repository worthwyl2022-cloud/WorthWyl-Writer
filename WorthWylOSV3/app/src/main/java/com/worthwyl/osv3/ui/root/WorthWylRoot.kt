package com.worthwyl.osv3.ui.root

import androidx.compose.foundation.layout.padding
import androidx.compose.material.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.worthwyl.osv3.ui.writer.NovelWriterScreen
import com.worthwyl.osv3.ui.os.SettingsScreen

@Composable
fun WorthWylRoot() {
    val navController = rememberNavController()
    Scaffold(
        bottomBar = {
            BottomNavigation(backgroundColor = MaterialTheme.colors.surface) {
                BottomNavigationItem(
                    selected = false,
                    onClick = { navController.navigate("writer") },
                    label = { Text("Writer") },
                    icon = { /* Use Icons.Default.Edit */ }
                )
                BottomNavigationItem(
                    selected = false,
                    onClick = { navController.navigate("settings") },
                    label = { Text("Settings") },
                    icon = { /* Use Icons.Default.Settings */ }
                )
            }
        }
    ) { padding ->
        NavHost(navController, startDestination = "writer", modifier = Modifier.padding(padding)) {
            composable("writer") { NovelWriterScreen() }
            composable("settings") { SettingsScreen() }
        }
    }
}
