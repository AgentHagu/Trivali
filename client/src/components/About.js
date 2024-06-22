import { useEffect, useState } from "react";
import useUserData from "../hooks/useUserData";
import TextEditor from "./TextEditor";

export default function About({ projectId, data, socket }) {
    return <div className="container pb-3 px-3">
        <div className="row mb-2">
            <div className="col-8 pt-2 d-flex flex-column">
                <h3 className="fw-bold">About:</h3>
                <div className="border border-2 flex-grow-1">
                    <TextEditor page="about" number="0" placeholder="Describe about your trip here!"/>
                </div>
            </div>


            <div className="col pt-2 d-flex flex-column">
                <h3 className="fw-bold">Destination:</h3>
                <div className="border border-2 mb-2">
                    <TextEditor page="about" number="1" placeholder="Where are you going?"/>
                </div>

                <h3 className="fw-bold">Duration:</h3>
                <div className="border border-2 mb-2">
                    <TextEditor page="about" number="2" placeholder="How long will the trip last?"/>
                </div>

                <h3 className="fw-bold">Budget:</h3>
                <div className="border border-2 mb">
                    <TextEditor page="about" number="3" placeholder="What's your budget for the trip?"/>
                </div>
            </div>
        </div>

        <div className="row">
            <div className="col-6">
                <h3 className="fw-bold">Accomodation:</h3>
                <div className="border border-2 mb-2">
                    <TextEditor page="about" number="4" placeholder="Where will you be staying?"/>
                </div>
            </div>

        </div>

    </div>
}