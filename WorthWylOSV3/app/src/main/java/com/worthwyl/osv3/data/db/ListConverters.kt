package com.worthwyl.osv3.data.db

import androidx.room.TypeConverter

class ListConverters {
    @TypeConverter
    fun fromStringList(value: List<String>?): String = value?.joinToString(",") ?: ""

    @TypeConverter
    fun toStringList(value: String): List<String> = if (value.isEmpty()) emptyList() else value.split(",")
}
