import pandas as pd
import pint
import pint_pandas

ureg = pint.UnitRegistry()
ureg.Unit.default_format = "~P"
pint_pandas.PintType.ureg.default_format = "~P"

df = pd.DataFrame({
    "temperature": pd.Series([1.2, 7.8, 3.4], dtype="pint[°C]"),
    "soil_temperature": pd.Series([3.4, 9.0, 5.6], dtype="pint[°C]"),
})


df['temperature'] = df['temperature'].pint.to("°F")
print(df.pint.dequantify())
