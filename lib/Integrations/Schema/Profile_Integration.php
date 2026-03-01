<?php

namespace DC23\Portfolio\Integrations\Schema;

use DC23\Portfolio\Generators\Schema\Profile;

final class Profile_Integration {
    public function register(): void {
        \add_filter( 'wpseo_schema_graph_pieces', [ $this, 'add_profile' ], 10, 2 );
   }

    /**
     * Adds a profile graph piece to the schema collector.
     *
     * @param list<Abstract_Schema_Piece> $pieces  The current graph pieces.
     * @param Meta_Tags_Context           $context The current context.
     *
     * @return list<Abstract_Schema_Piece> The graph pieces.
     */
    public function add_software_app( $pieces, $context ) {
       $pieces[] = new Profile( $context );
    
       return $pieces;
    }
    
}
    
