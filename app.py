# Import Dependencies
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from sqlalchemy import Column, Integer, String, Float, Date
import numpy as np
import pandas as pd
from flask import Flask, jsonify, render_template

# Create an engine sqlite database
engine = create_engine("sqlite:///belly_button_biodiversity.sqlite", connect_args={'check_same_thread': False})

# Reflect Database into ORM classes
Base = automap_base()
Base.prepare(engine, reflect=True)

# Save a reference
OTU = Base.classes.otu
Samples = Base.classes.samples
Samples_Metadata = Base.classes.samples_metadata

# Create a database session object
session = Session(engine)

# Flask
app = Flask(__name__)

# Flask routes
@app.route("/")
def index():
    return render_template("index.html")

@app.route('/names')
def sampleNames():
    sample_names = []
    for sample_id in session.query(Samples_Metadata.SAMPLEID).all():
        sample_names.append("BB_" + str(sample_id[0]))
    return jsonify(sample_names)


@app.route('/otu')
def otuDesc():
    otu_descriptions=[]
    for otu_desc in session.query(OTU.lowest_taxonomic_unit_found).all():
        otu_descriptions.append(otu_desc[0])
    return jsonify(otu_descriptions)

@app.route('/metadata/<sampleid>')
def metasample(sampleid):
    metasample_dict={}
    clean_id = sampleid[3:]
    for x in session.query(Samples_Metadata.AGE, Samples_Metadata.BBTYPE, Samples_Metadata.ETHNICITY, Samples_Metadata.GENDER,
              Samples_Metadata.LOCATION, Samples_Metadata.SAMPLEID).filter(Samples_Metadata.SAMPLEID == clean_id):
        metasample_dict['AGE'] = x[0]
        metasample_dict['BBTYPE'] = x[1]
        metasample_dict['ETHNICITY'] = x[2]
        metasample_dict['GENDER'] = x[3]
        metasample_dict['LOCATION'] = x[4]
        metasample_dict['SAMPLEID'] = x[5]
    return jsonify(metasample_dict)

@app.route('/wfreq/<sampleid>')
def wfreq(sampleid):
    clean_id = sampleid[3:]
    for x in session.query(Samples_Metadata.WFREQ).filter(Samples_Metadata.SAMPLEID == clean_id):
        wash_freq = x
    return jsonify(wash_freq)

@app.route('/samples/<sampleid>')
def samples(sampleid):
    samples_query = session.query(Samples)
    df = pd.read_sql_query(samples_query.statement, session.bind)
    df = df[df[sampleid] > 1].sort_values(by= sampleid, ascending= False)
    df = df[['otu_id', sampleid]]
    sample_dict = df.to_dict(orient='list')
    sample_dict['otu_ids'] = sample_dict.pop('otu_id')
    sample_dict['sample_values'] = sample_dict.pop(sampleid)
    return jsonify(sample_dict)


# Initiate Flask app
if __name__ == "__main__":
    app.run(debug=True)