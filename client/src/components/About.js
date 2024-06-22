import { useEffect, useState } from "react";
import useUserData from "../hooks/useUserData";
import TextEditor from "./TextEditor";

export default function About({ projectId, data, socket }) {
    return <div class="container pb-3 px-3">
        <div class="row mb-2">
            <div class="col-8 pt-2 d-flex flex-column">
                <h3 class="fw-bold">About:</h3>
                <div class="border border-2 flex-grow-1">
                    <TextEditor page="about" number="0" />
                </div>
            </div>


            <div class="col pt-2 d-flex flex-column">
                <h3 class="fw-bold">Destination:</h3>
                <div class="border border-2 mb-2">
                    <TextEditor page="about" number="1" />
                </div>

                <h3 class="fw-bold">Duration:</h3>
                <div class="border border-2 mb-2">
                    <TextEditor page="about" number="2" />
                </div>

                <h3 class="fw-bold">Budget:</h3>
                <div class="border border-2 mb">
                    <TextEditor page="about" number="3" />
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-6">
                <h3 class="fw-bold">Hotel:</h3>
                <div class="border border-2 mb-2">
                    <TextEditor page="about" number="4" />
                </div>
            </div>

        </div>

    </div>
}