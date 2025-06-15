import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Tape } from '@/types/api';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TapeDetailsAccordionProps {
  tape: Tape;
}

export function TapeDetailsAccordion({ tape }: TapeDetailsAccordionProps) {
  const [openSections, setOpenSections] = useState<string[]>(['general']);

  const handleValueChange = (value: string[]) => {
    setOpenSections(value);
  };

  return (
    <div className="w-full">
      <Accordion.Root 
        type="multiple"
        value={openSections}
        onValueChange={handleValueChange}
        className="space-y-4"
      >
        {/* General Information */}
        <Accordion.Item 
          value="general"
          className="overflow-hidden rounded-lg border border-gray-200 bg-white"
        >
          <Accordion.Trigger className="group flex h-12 w-full items-center justify-between px-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
            <span>General Information</span>
            <ChevronDownIcon 
              className="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" 
              aria-hidden="true"
            />
          </Accordion.Trigger>
          <Accordion.Content className="overflow-hidden">
            <div className="px-4 py-3">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tape.title && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Title</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.title}</dd>
                  </div>
                )}
                {tape.edition && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Edition</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.edition}</dd>
                  </div>
                )}
                {tape.year && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Release Year</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.year}</dd>
                  </div>
                )}
                {tape.vhsReleaseYear && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">VHS Release Year</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.vhsReleaseYear}</dd>
                  </div>
                )}
                {tape.runningTime && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Running Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.runningTime} minutes</dd>
                  </div>
                )}
                {tape.genre && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Genre</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.genre}</dd>
                  </div>
                )}
                {tape.format && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Format</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.format}</dd>
                  </div>
                )}
                {tape.label && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Label</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.label}</dd>
                  </div>
                )}
              </dl>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Packaging & Condition */}
        <Accordion.Item 
          value="packaging"
          className="overflow-hidden rounded-lg border border-gray-200 bg-white"
        >
          <Accordion.Trigger className="group flex h-12 w-full items-center justify-between px-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
            <span>Packaging & Condition</span>
            <ChevronDownIcon 
              className="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" 
              aria-hidden="true"
            />
          </Accordion.Trigger>
          <Accordion.Content className="overflow-hidden">
            <div className="px-4 py-3">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tape.packagingType && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Packaging Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.packagingType}</dd>
                  </div>
                )}
                {tape.physicalCondition && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Physical Condition</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.physicalCondition}</dd>
                  </div>
                )}
                {tape.specialFeatures && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Special Features</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.specialFeatures}</dd>
                  </div>
                )}
              </dl>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Production & Distribution */}
        <Accordion.Item 
          value="production"
          className="overflow-hidden rounded-lg border border-gray-200 bg-white"
        >
          <Accordion.Trigger className="group flex h-12 w-full items-center justify-between px-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
            <span>Production & Distribution</span>
            <ChevronDownIcon 
              className="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" 
              aria-hidden="true"
            />
          </Accordion.Trigger>
          <Accordion.Content className="overflow-hidden">
            <div className="px-4 py-3">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tape.distributor && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Distributor</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.distributor}</dd>
                  </div>
                )}
                {tape.productionCompany && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Production Company</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.productionCompany}</dd>
                  </div>
                )}
                {tape.publisher && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Publisher</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.publisher.name}</dd>
                  </div>
                )}
                {tape.catalogNumber && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Catalog Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.catalogNumber}</dd>
                  </div>
                )}
                {tape.upcBarcode && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">UPC Barcode</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.upcBarcode}</dd>
                  </div>
                )}
              </dl>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Video & Audio Specs */}
        <Accordion.Item 
          value="specs"
          className="overflow-hidden rounded-lg border border-gray-200 bg-white"
        >
          <Accordion.Trigger className="group flex h-12 w-full items-center justify-between px-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
            <span>Video & Audio Specs</span>
            <ChevronDownIcon 
              className="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" 
              aria-hidden="true"
            />
          </Accordion.Trigger>
          <Accordion.Content className="overflow-hidden">
            <div className="px-4 py-3">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tape.videoStandard && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Video Standard</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.videoStandard}</dd>
                  </div>
                )}
                {tape.audioType && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Audio Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.audioType}</dd>
                  </div>
                )}
                {tape.rating && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Rating</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.rating}</dd>
                  </div>
                )}
                {tape.languages && tape.languages.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Languages</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.languages.join(', ')}</dd>
                  </div>
                )}
                {tape.subtitles && tape.subtitles.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Subtitles</dt>
                    <dd className="mt-1 text-sm text-gray-900">{tape.subtitles.join(', ')}</dd>
                  </div>
                )}
              </dl>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
} 